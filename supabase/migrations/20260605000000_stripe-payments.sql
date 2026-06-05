-- ============================================================
-- Stripe payments integration
-- Tabla payments + funciones admin para panel de ventas
-- ============================================================

-- Tabla payments: registra cada transacción completada
CREATE TABLE public.payments (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  course_id              uuid        NOT NULL REFERENCES public.courses(id) ON DELETE SET NULL,
  enrollment_id          uuid        REFERENCES public.enrollments(id) ON DELETE SET NULL,
  stripe_session_id      text        NOT NULL UNIQUE,
  stripe_payment_intent  text,
  amount_cents           integer     NOT NULL,
  currency               text        NOT NULL DEFAULT 'eur',
  status                 text        NOT NULL DEFAULT 'pending',
  created_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user      ON public.payments(user_id);
CREATE INDEX idx_payments_course    ON public.payments(course_id);
CREATE INDEX idx_payments_status    ON public.payments(status);
CREATE INDEX idx_payments_created   ON public.payments(created_at DESC);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Los alumnos solo ven sus propios pagos
CREATE POLICY "users_select_own_payments" ON public.payments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins ven todos los pagos
CREATE POLICY "admins_select_all_payments" ON public.payments
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Solo service role puede insertar/actualizar (vía webhook)
-- No se necesitan políticas INSERT/UPDATE para usuarios autenticados


-- ============================================================
-- Funciones admin para el panel de Ventas
-- ============================================================

-- 1. Estadísticas globales de pagos
CREATE OR REPLACE FUNCTION public.admin_get_payment_stats()
RETURNS TABLE (
  total_revenue_cents       bigint,
  month_revenue_cents       bigint,
  prev_month_revenue_cents  bigint,
  total_payment_count       bigint,
  month_payment_count       bigint
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
    COALESCE(SUM(amount_cents) FILTER (WHERE status = 'succeeded'), 0)::bigint,
    COALESCE(SUM(amount_cents) FILTER (
      WHERE status = 'succeeded'
        AND date_trunc('month', created_at) = date_trunc('month', now())
    ), 0)::bigint,
    COALESCE(SUM(amount_cents) FILTER (
      WHERE status = 'succeeded'
        AND date_trunc('month', created_at) = date_trunc('month', now() - interval '1 month')
    ), 0)::bigint,
    COUNT(*) FILTER (WHERE status = 'succeeded')::bigint,
    COUNT(*) FILTER (
      WHERE status = 'succeeded'
        AND date_trunc('month', created_at) = date_trunc('month', now())
    )::bigint
  FROM public.payments;
END;
$$;

-- 2. Lista de pagos recientes con detalle de alumno y curso
CREATE OR REPLACE FUNCTION public.admin_get_recent_payments(_limit integer DEFAULT 20)
RETURNS TABLE (
  id                    uuid,
  user_id               uuid,
  course_id             uuid,
  student_name          text,
  student_email         text,
  course_title          text,
  course_slug           text,
  amount_cents          integer,
  currency              text,
  status                text,
  stripe_session_id     text,
  created_at            timestamptz
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
    p.user_id,
    p.course_id,
    pr.full_name,
    u.email::text,
    c.title,
    c.slug,
    p.amount_cents,
    p.currency,
    p.status,
    p.stripe_session_id,
    p.created_at
  FROM public.payments p
  JOIN public.courses c    ON c.id  = p.course_id
  JOIN public.profiles pr  ON pr.id = p.user_id
  JOIN auth.users u        ON u.id  = p.user_id
  ORDER BY p.created_at DESC
  LIMIT _limit;
END;
$$;

-- Lock down permissions
REVOKE EXECUTE ON FUNCTION public.admin_get_payment_stats()             FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_get_recent_payments(integer)    FROM PUBLIC, anon;

GRANT  EXECUTE ON FUNCTION public.admin_get_payment_stats()             TO authenticated;
GRANT  EXECUTE ON FUNCTION public.admin_get_recent_payments(integer)    TO authenticated;
