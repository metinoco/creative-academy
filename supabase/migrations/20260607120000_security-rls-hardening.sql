-- ─── SECURITY HARDENING — RLS & FUNCTION GRANTS ──────────────────────────────
-- Auditoría 2026-06-07. Cinco problemas encontrados y corregidos:
--   1. Política de auto-matrícula (bypass de Stripe) → DROP
--   2. Funciones admin con GRANT TO PUBLIC (incluye anon) → REVOKE
--   3. toggle_question_vote invocable por anon → REVOKE
--   4. Políticas Q&A/notas con rol {public} → recrear con TO authenticated
--   5. Storage bucket certificates permite directory listing → restringir

-- ─── 1. ELIMINAR POLÍTICA DE AUTO-MATRÍCULA ───────────────────────────────────
-- Esta política temporal debía eliminarse antes del go-live de Stripe.
-- Con ella activa cualquier usuario autenticado puede insertarse en enrollments
-- sin pagar, saltándose el flujo de Stripe completamente.
DROP POLICY IF EXISTS "Students can self-enroll (temp — remove before Stripe go-live"
  ON public.enrollments;

-- ─── 2. REVOCAR EXECUTE EN FUNCIONES ADMIN EXPUESTAS A ANON ──────────────────
-- Tres funciones recibieron GRANT TO PUBLIC accidentalmente (incluye rol anon).
-- Aunque tienen guards internos has_role(), anon no debe poder invocarlas.

-- REVOKE FROM PUBLIC elimina el grant del rol PUBLIC, pero si el rol anon
-- también tenía grant explícito hay que revocarlo por separado.
REVOKE EXECUTE ON FUNCTION public.admin_get_course_completion_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_course_completion_stats() FROM anon;
GRANT  EXECUTE ON FUNCTION public.admin_get_course_completion_stats() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_get_qa_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_qa_stats() FROM anon;
GRANT  EXECUTE ON FUNCTION public.admin_get_qa_stats() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_get_revenue_by_course() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_revenue_by_course() FROM anon;
GRANT  EXECUTE ON FUNCTION public.admin_get_revenue_by_course() TO authenticated;

-- ─── 3. REVOCAR EXECUTE EN toggle_question_vote PARA ANON ────────────────────
-- Votar en preguntas requiere estar matriculado; anon nunca debe poder llamar
-- esta función. Falla en FK constraint, pero no debería ser invocable.

REVOKE EXECUTE ON FUNCTION public.toggle_question_vote(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.toggle_question_vote(uuid) FROM anon;
GRANT  EXECUTE ON FUNCTION public.toggle_question_vote(uuid)
  TO authenticated;

-- ─── 4. POLÍTICAS Q&A Y NOTAS: CAMBIAR DE {public} A authenticated ────────────
-- Las políticas creadas sin TO <role> aplican al rol PUBLIC (anon + authenticated).
-- Las condiciones auth.uid() = user_id ya bloquean el acceso anon en la práctica,
-- pero las recreamos con TO authenticated para ser explícitos y silenciar el advisor.

-- lesson_notes
DROP POLICY IF EXISTS "users manage own notes"    ON public.lesson_notes;
DROP POLICY IF EXISTS "admins manage all notes"   ON public.lesson_notes;

CREATE POLICY "users manage own notes"
  ON public.lesson_notes
  FOR ALL
  TO authenticated
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins manage all notes"
  ON public.lesson_notes
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- lesson_questions
DROP POLICY IF EXISTS "enrolled users insert questions" ON public.lesson_questions;
DROP POLICY IF EXISTS "enrolled users read questions"   ON public.lesson_questions;
DROP POLICY IF EXISTS "admins manage questions"         ON public.lesson_questions;

CREATE POLICY "enrolled users insert questions"
  ON public.lesson_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id)
    AND has_course_access(auth.uid(), course_id)
  );

CREATE POLICY "enrolled users read questions"
  ON public.lesson_questions
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_course_access(auth.uid(), course_id)
  );

CREATE POLICY "admins manage questions"
  ON public.lesson_questions
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- lesson_answers
DROP POLICY IF EXISTS "enrolled users insert answers" ON public.lesson_answers;
DROP POLICY IF EXISTS "enrolled users read answers"   ON public.lesson_answers;
DROP POLICY IF EXISTS "admins manage answers"         ON public.lesson_answers;

CREATE POLICY "enrolled users insert answers"
  ON public.lesson_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id)
    AND EXISTS (
      SELECT 1 FROM public.lesson_questions lq
      WHERE lq.id = lesson_answers.question_id
        AND has_course_access(auth.uid(), lq.course_id)
    )
  );

CREATE POLICY "enrolled users read answers"
  ON public.lesson_answers
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.lesson_questions lq
      WHERE lq.id = lesson_answers.question_id
        AND has_course_access(auth.uid(), lq.course_id)
    )
  );

CREATE POLICY "admins manage answers"
  ON public.lesson_answers
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- lesson_question_votes
DROP POLICY IF EXISTS "users manage own votes" ON public.lesson_question_votes;

CREATE POLICY "users manage own votes"
  ON public.lesson_question_votes
  FOR ALL
  TO authenticated
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 5. STORAGE: RESTRINGIR SELECT EN BUCKET certificates ────────────────────
-- La política amplia actual permite a anon listar todos los archivos del bucket
-- (directory listing). Los PDFs son accesibles por URL pública directa sin
-- necesitar esta política. La reemplazamos por una que solo permita a cada
-- alumno ver sus propios objetos vía la Storage API.

DROP POLICY IF EXISTS "certificates_storage_public_read" ON storage.objects;

-- Los alumnos solo acceden a sus propios certificados por la Storage API.
-- El path generado por la Edge Function es: <user_id>/<verification_code>.pdf
CREATE POLICY "certificates_storage_owner_read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'certificates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Las URLs públicas del bucket siguen funcionando sin esta política
-- (el bucket tiene public = true, el CDN no pasa por RLS).
