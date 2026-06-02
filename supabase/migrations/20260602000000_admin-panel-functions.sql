-- ============================================================
-- Admin panel helper functions (SECURITY DEFINER)
-- All functions verify has_role(admin) before executing.
-- ============================================================

-- 1. All students with email + active enrollment count
CREATE OR REPLACE FUNCTION public.admin_get_students()
RETURNS TABLE (
  id                    uuid,
  full_name             text,
  avatar_url            text,
  email                 text,
  created_at            timestamptz,
  active_enrollment_count bigint
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
    p.id,
    p.full_name,
    p.avatar_url,
    u.email::text,
    p.created_at,
    COUNT(e.id) FILTER (WHERE e.revoked_at IS NULL)
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.enrollments e ON e.user_id = p.id
  GROUP BY p.id, p.full_name, p.avatar_url, u.email, p.created_at
  ORDER BY p.created_at DESC;
END;
$$;

-- 2. Enrollments for a specific student (with course metadata)
CREATE OR REPLACE FUNCTION public.admin_get_student_enrollments(_user_id uuid)
RETURNS TABLE (
  enrollment_id uuid,
  course_id     uuid,
  course_title  text,
  course_slug   text,
  source        text,
  granted_at    timestamptz,
  revoked_at    timestamptz
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
    e.id,
    e.course_id,
    c.title,
    c.slug,
    e.source::text,
    e.granted_at,
    e.revoked_at
  FROM public.enrollments e
  JOIN public.courses c ON c.id = e.course_id
  WHERE e.user_id = _user_id
  ORDER BY e.granted_at DESC;
END;
$$;

-- 3. Grant access to a course (INSERT or re-activate revoked enrollment)
CREATE OR REPLACE FUNCTION public.admin_grant_course_access(_user_id uuid, _course_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  INSERT INTO public.enrollments (user_id, course_id, source, granted_at, revoked_at)
  VALUES (_user_id, _course_id, 'manual', now(), NULL)
  ON CONFLICT (user_id, course_id) DO UPDATE
    SET revoked_at  = NULL,
        granted_at  = CASE
                        WHEN public.enrollments.revoked_at IS NOT NULL THEN now()
                        ELSE public.enrollments.granted_at
                      END;
END;
$$;

-- 4. All courses with active enrollment counts
CREATE OR REPLACE FUNCTION public.admin_get_course_stats()
RETURNS TABLE (
  id                 uuid,
  slug               text,
  title              text,
  status             text,
  tone               text,
  price              integer,
  category           text,
  author             text,
  lessons_count      integer,
  active_enrollments bigint,
  created_at         timestamptz
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
    c.id,
    c.slug,
    c.title,
    c.status::text,
    c.tone::text,
    c.price,
    c.category,
    c.author,
    c.lessons_count,
    COUNT(e.id) FILTER (WHERE e.revoked_at IS NULL),
    c.created_at
  FROM public.courses c
  LEFT JOIN public.enrollments e ON e.course_id = c.id
  GROUP BY c.id, c.slug, c.title, c.status, c.tone, c.price,
           c.category, c.author, c.lessons_count, c.created_at
  ORDER BY active_enrollments DESC, c.created_at DESC;
END;
$$;

-- 5. Lock down execute permissions
REVOKE EXECUTE ON FUNCTION public.admin_get_students()                    FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_get_student_enrollments(uuid)     FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_grant_course_access(uuid, uuid)   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_get_course_stats()                FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_get_students()                     TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_student_enrollments(uuid)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_course_access(uuid, uuid)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_course_stats()                 TO authenticated;
