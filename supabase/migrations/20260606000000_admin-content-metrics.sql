-- ============================================================
-- Admin content & engagement metrics (SECURITY DEFINER)
-- All functions verify has_role(admin) before executing.
-- ============================================================

-- 1. Course completion rate per published course
CREATE OR REPLACE FUNCTION public.admin_get_course_completion_stats()
RETURNS TABLE (
  course_id       uuid,
  course_title    text,
  course_slug     text,
  total_enrolled  bigint,
  total_lessons   bigint,
  completed_all   bigint,
  completion_rate numeric
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
    student_progress AS (
      SELECT
        lp.course_id,
        lp.user_id,
        COUNT(*) FILTER (WHERE lp.completed = true) AS done_count
      FROM public.lesson_progress lp
      INNER JOIN active_enr ae ON ae.user_id = lp.user_id AND ae.course_id = lp.course_id
      GROUP BY lp.course_id, lp.user_id
    ),
    completions AS (
      SELECT
        sp.course_id,
        COUNT(*) FILTER (
          WHERE sp.done_count >= cl.lesson_count AND cl.lesson_count > 0
        ) AS fully_completed
      FROM student_progress sp
      JOIN course_lessons cl ON cl.course_id = sp.course_id
      GROUP BY sp.course_id
    )
  SELECT
    c.id                                   AS course_id,
    c.title                                AS course_title,
    c.slug                                 AS course_slug,
    COUNT(DISTINCT ae.user_id)             AS total_enrolled,
    COALESCE(cl.lesson_count, 0)           AS total_lessons,
    COALESCE(cc.fully_completed, 0)        AS completed_all,
    CASE
      WHEN COUNT(DISTINCT ae.user_id) = 0 THEN 0
      ELSE ROUND(
        COALESCE(cc.fully_completed, 0)::numeric
        / COUNT(DISTINCT ae.user_id) * 100, 1
      )
    END AS completion_rate
  FROM public.courses c
  LEFT JOIN active_enr ae ON ae.course_id = c.id
  LEFT JOIN course_lessons cl ON cl.course_id = c.id
  LEFT JOIN completions cc ON cc.course_id = c.id
  WHERE c.status = 'published'
  GROUP BY c.id, c.title, c.slug, cl.lesson_count, cc.fully_completed
  ORDER BY total_enrolled DESC;
END;
$$;

-- 2. Revenue breakdown per published course
CREATE OR REPLACE FUNCTION public.admin_get_revenue_by_course()
RETURNS TABLE (
  course_id           uuid,
  course_title        text,
  course_slug         text,
  total_revenue_cents bigint,
  payment_count       bigint
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
  SELECT
    c.id                              AS course_id,
    c.title                           AS course_title,
    c.slug                            AS course_slug,
    COALESCE(SUM(p.amount_cents), 0)::bigint  AS total_revenue_cents,
    COUNT(p.id)                       AS payment_count
  FROM public.courses c
  LEFT JOIN public.payments p ON p.course_id = c.id AND p.status = 'succeeded'
  WHERE c.status = 'published'
  GROUP BY c.id, c.title, c.slug
  ORDER BY total_revenue_cents DESC;
END;
$$;

-- 3. Q&A engagement stats: total questions, answered, unanswered
CREATE OR REPLACE FUNCTION public.admin_get_qa_stats()
RETURNS TABLE (
  total_questions  bigint,
  answered_count   bigint,
  unanswered_count bigint
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
  SELECT
    COUNT(DISTINCT q.id)                                             AS total_questions,
    COUNT(DISTINCT a.question_id)                                    AS answered_count,
    COUNT(DISTINCT q.id) - COUNT(DISTINCT a.question_id)             AS unanswered_count
  FROM public.lesson_questions q
  LEFT JOIN public.lesson_answers a ON a.question_id = q.id;
END;
$$;
