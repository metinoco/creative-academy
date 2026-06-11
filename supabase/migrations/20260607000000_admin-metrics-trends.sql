-- ============================================================
-- Admin metrics: monthly trends, progress distribution,
-- at-risk students (SECURITY DEFINER)
-- All functions verify has_role(admin) before executing.
-- ============================================================

-- 1. Monthly revenue — last 12 calendar months, zero-filled via generate_series
CREATE OR REPLACE FUNCTION public.admin_get_monthly_revenue()
RETURNS TABLE (
  month         text,
  total_cents   bigint,
  payment_count bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  RETURN QUERY
  WITH months AS (
    SELECT TO_CHAR(m::date, 'YYYY-MM') AS month
    FROM generate_series(
      DATE_TRUNC('month', NOW()) - INTERVAL '11 months',
      DATE_TRUNC('month', NOW()),
      INTERVAL '1 month'
    ) AS m
  ),
  revenue AS (
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
      COALESCE(SUM(amount_cents), 0)::bigint               AS total_cents,
      COUNT(*)::bigint                                      AS payment_count
    FROM public.payments
    WHERE status = 'succeeded'
      AND created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
    GROUP BY DATE_TRUNC('month', created_at)
  )
  SELECT
    mo.month,
    COALESCE(r.total_cents,   0) AS total_cents,
    COALESCE(r.payment_count, 0) AS payment_count
  FROM months mo
  LEFT JOIN revenue r ON r.month = mo.month
  ORDER BY mo.month;
END;
$$;

-- 2. Monthly new enrollments — last 12 calendar months, zero-filled
CREATE OR REPLACE FUNCTION public.admin_get_monthly_enrollments()
RETURNS TABLE (
  month            text,
  enrollment_count bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  RETURN QUERY
  WITH months AS (
    SELECT TO_CHAR(m::date, 'YYYY-MM') AS month
    FROM generate_series(
      DATE_TRUNC('month', NOW()) - INTERVAL '11 months',
      DATE_TRUNC('month', NOW()),
      INTERVAL '1 month'
    ) AS m
  ),
  enrs AS (
    SELECT
      TO_CHAR(DATE_TRUNC('month', granted_at), 'YYYY-MM') AS month,
      COUNT(*)::bigint                                      AS enrollment_count
    FROM public.enrollments
    WHERE granted_at >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
    GROUP BY DATE_TRUNC('month', granted_at)
  )
  SELECT
    mo.month,
    COALESCE(e.enrollment_count, 0) AS enrollment_count
  FROM months mo
  LEFT JOIN enrs e ON e.month = mo.month
  ORDER BY mo.month;
END;
$$;

-- 3. Progress distribution per published course
--    Returns per-course bucket counts: 0%, 1-25%, 26-50%, 51-75%, 76-99%, 100%
CREATE OR REPLACE FUNCTION public.admin_get_progress_distribution()
RETURNS TABLE (
  course_id      uuid,
  course_title   text,
  total_enrolled bigint,
  total_lessons  bigint,
  b0             bigint,
  b1_25          bigint,
  b26_50         bigint,
  b51_75         bigint,
  b76_99         bigint,
  b100           bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  RETURN QUERY
  WITH
    course_lessons AS (
      SELECT l.course_id, COUNT(*) AS lesson_count
      FROM public.lessons l
      GROUP BY l.course_id
    ),
    active_enr AS (
      SELECT e.course_id, e.user_id
      FROM public.enrollments e
      WHERE e.revoked_at IS NULL
    ),
    student_pct AS (
      SELECT
        ae.course_id,
        ae.user_id,
        CASE
          WHEN COALESCE(cl.lesson_count, 0) = 0 THEN 0
          ELSE LEAST(100, ROUND(
            COUNT(lp.id) FILTER (WHERE lp.completed = true)::numeric
            / cl.lesson_count * 100
          ))
        END AS pct
      FROM active_enr ae
      LEFT JOIN public.lesson_progress lp
        ON lp.user_id = ae.user_id AND lp.course_id = ae.course_id
      LEFT JOIN course_lessons cl ON cl.course_id = ae.course_id
      GROUP BY ae.course_id, ae.user_id, cl.lesson_count
    )
  SELECT
    c.id                                                            AS course_id,
    c.title                                                         AS course_title,
    COUNT(DISTINCT ae.user_id)::bigint                              AS total_enrolled,
    COALESCE(MAX(cl.lesson_count), 0)::bigint                       AS total_lessons,
    COUNT(*) FILTER (WHERE sp.pct = 0)::bigint                      AS b0,
    COUNT(*) FILTER (WHERE sp.pct BETWEEN 1  AND 25)::bigint        AS b1_25,
    COUNT(*) FILTER (WHERE sp.pct BETWEEN 26 AND 50)::bigint        AS b26_50,
    COUNT(*) FILTER (WHERE sp.pct BETWEEN 51 AND 75)::bigint        AS b51_75,
    COUNT(*) FILTER (WHERE sp.pct BETWEEN 76 AND 99)::bigint        AS b76_99,
    COUNT(*) FILTER (WHERE sp.pct = 100)::bigint                    AS b100
  FROM public.courses c
  INNER JOIN active_enr ae ON ae.course_id = c.id
  LEFT JOIN student_pct sp ON sp.course_id = c.id AND sp.user_id = ae.user_id
  LEFT JOIN course_lessons cl ON cl.course_id = c.id
  WHERE c.status = 'published'
  GROUP BY c.id, c.title
  ORDER BY total_enrolled DESC;
END;
$$;

-- 4. At-risk students: enrolled > _days ago with 0 completed lessons
CREATE OR REPLACE FUNCTION public.admin_get_at_risk_students(_days int DEFAULT 30)
RETURNS TABLE (
  user_id      uuid,
  full_name    text,
  email        text,
  course_id    uuid,
  course_title text,
  course_slug  text,
  granted_at   timestamptz,
  days_inactive int
)
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  RETURN QUERY
  SELECT
    p.id                                                       AS user_id,
    p.full_name,
    u.email::text,
    c.id                                                       AS course_id,
    c.title                                                    AS course_title,
    c.slug                                                     AS course_slug,
    e.granted_at,
    (EXTRACT(EPOCH FROM (NOW() - e.granted_at)) / 86400)::int  AS days_inactive
  FROM public.enrollments e
  JOIN public.profiles p ON p.id = e.user_id
  JOIN auth.users u ON u.id = e.user_id
  JOIN public.courses c ON c.id = e.course_id
  WHERE e.revoked_at IS NULL
    AND e.granted_at <= NOW() - (_days || ' days')::interval
    AND NOT EXISTS (
      SELECT 1
      FROM public.lesson_progress lp
      WHERE lp.user_id = e.user_id
        AND lp.course_id = e.course_id
        AND lp.completed = true
    )
  ORDER BY days_inactive DESC;
END;
$$;

-- 5. Lock down execute permissions
REVOKE EXECUTE ON FUNCTION public.admin_get_monthly_revenue()       FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_get_monthly_enrollments()   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_get_progress_distribution() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_get_at_risk_students(int)   FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_get_monthly_revenue()        TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_monthly_enrollments()    TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_progress_distribution()  TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_at_risk_students(int)    TO authenticated;
