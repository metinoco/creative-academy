-- ─────────────────────────────────────────────────────────────────────────────
-- Activity Reminder — detección de alumnos inactivos en un curso comprado
--
-- Diferencia con admin_get_at_risk_students (trends, 2026-06-07):
--   · Esa función solo captura alumnos con 0 lecciones completadas.
--   · Esta captura también alumnos que empezaron pero llevan más de
--     `days_inactive` días sin completar ninguna lección nueva.
--
-- Lógica de "última actividad":
--   · Si hay lecciones completadas → MAX(completed_at) de lesson_progress
--   · Si nunca completaron nada   → granted_at de la matrícula
--
-- Exclusiones:
--   · Matrículas revocadas (revoked_at IS NOT NULL)
--   · Matrículas de seed (fuente = 'seed') — datos de prueba
--   · Alumnos que ya tienen certificado del curso (lo terminaron)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_inactive_enrolled_students(
  days_inactive integer DEFAULT 14
)
RETURNS TABLE (
  user_id       uuid,
  email         text,
  full_name     text,
  course_id     uuid,
  course_title  text,
  course_slug   text,
  days_since    integer,
  last_activity timestamptz,
  lessons_done  integer
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
    e.user_id,
    u.email::text,
    p.full_name,
    e.course_id,
    c.title                                                                      AS course_title,
    c.slug                                                                       AS course_slug,
    EXTRACT(DAY FROM NOW() - COALESCE(
      MAX(lp.completed_at) FILTER (WHERE lp.completed = true),
      e.granted_at
    ))::integer                                                                  AS days_since,
    COALESCE(
      MAX(lp.completed_at) FILTER (WHERE lp.completed = true),
      e.granted_at
    )                                                                            AS last_activity,
    COUNT(lp.id) FILTER (WHERE lp.completed = true)::integer                    AS lessons_done
  FROM public.enrollments e
  JOIN auth.users          u  ON u.id  = e.user_id
  JOIN public.profiles     p  ON p.id  = e.user_id
  JOIN public.courses      c  ON c.id  = e.course_id
  LEFT JOIN public.lesson_progress lp
    ON lp.user_id = e.user_id AND lp.course_id = e.course_id
  WHERE
    e.revoked_at IS NULL
    AND e.source IN ('purchase', 'manual')
    AND NOT EXISTS (
      SELECT 1 FROM public.certificates cert
      WHERE cert.user_id = e.user_id AND cert.course_id = e.course_id
    )
  GROUP BY e.user_id, u.email, p.full_name, e.course_id, c.title, c.slug, e.granted_at
  HAVING
    COALESCE(
      MAX(lp.completed_at) FILTER (WHERE lp.completed = true),
      e.granted_at
    ) < NOW() - (days_inactive || ' days')::interval
  ORDER BY days_since DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_inactive_enrolled_students(integer) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_inactive_enrolled_students(integer) TO authenticated;
