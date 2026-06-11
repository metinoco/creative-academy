-- ─── CERTIFICATES ──────────────────────────────────────────────────────────

CREATE TABLE certificates (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id         uuid        NOT NULL REFERENCES courses(id)    ON DELETE CASCADE,
  recipient_name    text        NOT NULL,
  -- Short uppercase code for human-readable verification (e.g. "A3B7F2E1")
  verification_code text        NOT NULL UNIQUE
                                DEFAULT upper(substring(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 8)),
  issued_at         timestamptz NOT NULL DEFAULT now(),
  pdf_url           text,
  UNIQUE (user_id, course_id)
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Authenticated users see only their own
CREATE POLICY "certificates_select_own"
  ON certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins see all
CREATE POLICY "certificates_select_admin"
  ON certificates FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ─── PUBLIC VERIFICATION FUNCTION ─────────────────────────────────────────
-- Called by the public /certificado/:codigo page (anon access, no auth needed)

CREATE OR REPLACE FUNCTION get_certificate_by_code(_code text)
RETURNS TABLE (
  recipient_name    text,
  course_title      text,
  instructor_name   text,
  issued_at         timestamptz,
  verification_code text,
  pdf_url           text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.recipient_name,
    co.title       AS course_title,
    co.author      AS instructor_name,
    c.issued_at,
    c.verification_code,
    c.pdf_url
  FROM certificates c
  JOIN courses co ON co.id = c.course_id
  WHERE c.verification_code = _code;
END;
$$;

GRANT EXECUTE ON FUNCTION get_certificate_by_code(text) TO anon, authenticated;

-- ─── STORAGE BUCKET ───────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  true,
  5242880,                  -- 5 MB max
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Public read (bucket is public, but explicit policy is best practice)
CREATE POLICY "certificates_storage_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'certificates');

-- Service role (Edge Function) can upload
CREATE POLICY "certificates_storage_service_insert"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "certificates_storage_service_update"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'certificates');
