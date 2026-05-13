
CREATE TYPE public.course_status AS ENUM ('draft', 'published');
CREATE TYPE public.course_tone AS ENUM ('warm', 'cream', 'sun', 'ink');
CREATE TYPE public.enrollment_source AS ENUM ('purchase', 'manual', 'seed');

CREATE TABLE public.courses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  title         text NOT NULL,
  subtitle      text,
  description   text,
  category      text,
  author        text,
  image_url     text,
  duration_text text,
  lessons_count integer NOT NULL DEFAULT 0,
  rating        numeric(3,2),
  reviews_count integer NOT NULL DEFAULT 0,
  price         integer NOT NULL DEFAULT 0,
  tone          public.course_tone NOT NULL DEFAULT 'warm',
  status        public.course_status NOT NULL DEFAULT 'draft',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       text NOT NULL,
  position    integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sections_course ON public.sections(course_id, position);

CREATE TABLE public.lessons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      uuid NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  course_id       uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  video_url       text,
  content         text,
  duration_minutes integer NOT NULL DEFAULT 0,
  position        integer NOT NULL DEFAULT 0,
  is_free_preview boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lessons_section ON public.lessons(section_id, position);
CREATE INDEX idx_lessons_course  ON public.lessons(course_id);

CREATE TABLE public.enrollments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  course_id   uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  source      public.enrollment_source NOT NULL DEFAULT 'manual',
  granted_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);

CREATE TABLE public.lesson_progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  lesson_id     uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id     uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed     boolean NOT NULL DEFAULT true,
  completed_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
CREATE INDEX idx_progress_user_course ON public.lesson_progress(user_id, course_id);

CREATE TRIGGER trg_courses_updated  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_sections_updated BEFORE UPDATE ON public.sections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_lessons_updated  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.has_course_access(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = _user_id
      AND course_id = _course_id
      AND revoked_at IS NULL
  );
$$;

ALTER TABLE public.courses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses are public"
  ON public.courses FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage courses"
  ON public.courses FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sections of published courses are public"
  ON public.sections FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id
        AND (c.status = 'published' OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins manage sections"
  ON public.sections FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anon reads free preview lessons only"
  ON public.lessons FOR SELECT
  TO anon
  USING (
    is_free_preview = true
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.status = 'published'
    )
  );

CREATE POLICY "Authenticated reads lessons with access"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (
      is_free_preview = true
      AND EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_id AND c.status = 'published'
      )
    )
    OR public.has_course_access(auth.uid(), course_id)
  );

CREATE POLICY "Admins manage lessons"
  ON public.lessons FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE VIEW public.lessons_public
WITH (security_invoker = on) AS
SELECT
  id, section_id, course_id, title, description, duration_minutes,
  position, is_free_preview, created_at
FROM public.lessons;

CREATE OR REPLACE FUNCTION public.get_lesson_content(_lesson_id uuid)
RETURNS TABLE (
  id uuid,
  section_id uuid,
  course_id uuid,
  title text,
  description text,
  video_url text,
  content text,
  duration_minutes integer,
  pos integer,
  is_free_preview boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.section_id, l.course_id, l.title, l.description,
         l.video_url, l.content, l.duration_minutes, l.position, l.is_free_preview
  FROM public.lessons l
  WHERE l.id = _lesson_id
    AND (
      l.is_free_preview
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_course_access(auth.uid(), l.course_id)
    );
END;
$$;

CREATE POLICY "Users view own enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage enrollments"
  ON public.enrollments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own progress"
  ON public.lesson_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own progress with access"
  ON public.lesson_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.has_course_access(auth.uid(), course_id)
  );

CREATE POLICY "Users update own progress"
  ON public.lesson_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own progress"
  ON public.lesson_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

INSERT INTO public.courses (slug, title, category, author, duration_text, lessons_count, rating, reviews_count, price, tone, status, description) VALUES
('marca-magnetica',     'Marca magnética: identidad que enamora',          'Identidad de marca', 'Andrés Mora',      '12 h 45 min', 48, 4.9, 1284, 197, 'warm',  'published', 'Diseña una identidad visual que conecte y perdure.'),
('letras-vivas',        'Letras vivas: tipografía con personalidad',       'Tipografía',         'Inés Calvo',       '6 h 50 min',  24, 4.9, 412,  97,  'cream', 'published', 'Domina la tipografía con carácter para tus proyectos.'),
('trazos-pixel',        'Trazos en píxel: ilustración con iPad',           'Ilustración',        'Marina Reyes',     '9 h 10 min',  32, 4.7, 632,  147, 'sun',   'published', 'Aprende a ilustrar digitalmente desde cero con iPad.'),
('movimiento-color',    'Movimiento y color: motion para marcas',          'Animación',          'Carla Ríos',       '18 h 10 min', 64, 4.8, 891,  297, 'warm',  'published', 'Crea piezas de motion graphics profesionales.'),
('scroll-stop',         'Scroll stop: contenido que se mira dos veces',    'Social media',       'Pablo Soler',      '7 h 15 min',  28, 4.6, 318,  97,  'sun',   'published', 'Estrategias visuales para destacar en redes.'),
('papel-rejilla',       'Papel y rejilla: diseño editorial moderno',       'Editorial',          'Lucía Fernández',  '8 h 20 min',  32, 4.8, 542,  147, 'ink',   'published', 'Maquetación editorial contemporánea paso a paso.'),
('riso-postal',         'Riso & postal: imprime como en los 90',           'Print',              'Tomás Vidal',      '5 h 40 min',  22, 4.7, 264,  87,  'warm',  'published', 'Técnicas de impresión risográfica con estética retro.'),
('barro-torno',         'Barro al torno: cerámica para principiantes',     'Cerámica',           'Elena Sáez',       '10 h 05 min', 36, 4.9, 478,  167, 'cream', 'published', 'Inicia tu camino en la cerámica artesanal.'),
('agua-pigmento',       'Agua y pigmento: acuarela suelta',                'Pintura',            'Nicolás Prado',    '8 h 30 min',  30, 4.8, 392,  117, 'sun',   'published', 'Pinta con acuarela suelta y expresiva.'),
('luz-grano',           'Luz y grano: fotografía analógica',               'Fotografía',         'Aitana Bosch',     '11 h 20 min', 40, 4.8, 521,  167, 'warm',  'published', 'Redescubre el placer del carrete y el laboratorio.'),
('pluma-tinta',         'Pluma y tinta: lettering a mano alzada',          'Lettering',          'Joel Marín',       '6 h 15 min',  26, 4.7, 287,  97,  'ink',   'published', 'Lettering a mano con pluma y tinta.'),
('volumen-render',      'Volumen y render: 3D con Cinema 4D',              '3D',                 'Sara Quintana',    '16 h 40 min', 58, 4.8, 612,  247, 'sun',   'published', 'Modelado y render 3D con Cinema 4D.'),
('interfaces-vivas',    'Interfaces vivas: UX/UI desde producto',          'UX/UI',              'Diego Aranda',     '14 h 50 min', 54, 4.9, 738,  217, 'warm',  'published', 'UX/UI con mentalidad de producto digital.'),
('plano-secuencia',     'Plano secuencia: vídeo con cámara DSLR',          'Vídeo',              'Marta Esteve',     '13 h 25 min', 46, 4.7, 411,  197, 'ink',   'published', 'Graba vídeo profesional con tu cámara DSLR.'),
('ondas-podcast',       'Ondas: producción de podcast desde casa',         'Audio',              'Rubén Lago',       '7 h 50 min',  28, 4.6, 234,  117, 'warm',  'published', 'Monta tu estudio de podcast en casa.'),
('narrativa-creativa',  'Narrativa creativa: contar historias que enganchan','Escritura',        'Clara Vives',      '9 h 35 min',  34, 4.8, 356,  127, 'cream', 'published', 'Cuenta historias que conecten con tu audiencia.');

DO $seed$
DECLARE
  c_marca uuid;
  c_letras uuid;
  c_motion uuid;
  s1 uuid; s2 uuid; s3 uuid;
BEGIN
  SELECT id INTO c_marca  FROM public.courses WHERE slug = 'marca-magnetica';
  SELECT id INTO c_letras FROM public.courses WHERE slug = 'letras-vivas';
  SELECT id INTO c_motion FROM public.courses WHERE slug = 'movimiento-color';

  INSERT INTO public.sections (course_id, title, position) VALUES (c_marca, 'Fundamentos de marca', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (c_marca, 'Sistema visual', 2)       RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (c_marca, 'Aplicaciones reales', 3)  RETURNING id INTO s3;

  INSERT INTO public.lessons (section_id, course_id, title, description, video_url, duration_minutes, position, is_free_preview) VALUES
    (s1, c_marca, 'Bienvenida y enfoque del curso',     'Qué vas a construir y cómo aprovecharlo.',          'https://vimeo.com/76979871', 8,  1, true),
    (s1, c_marca, 'Qué es realmente una marca',         'Más allá del logo: percepción y promesa.',          'https://vimeo.com/76979871', 14, 2, false),
    (s1, c_marca, 'Investigación y posicionamiento',    'Mapeo competitivo y territorio propio.',            'https://vimeo.com/76979871', 22, 3, false),
    (s2, c_marca, 'Construcción del logotipo',          'De la idea a la marca verbal y visual.',            'https://vimeo.com/76979871', 28, 1, false),
    (s2, c_marca, 'Paleta cromática y tipografía',      'Define el tono visual del sistema.',                'https://vimeo.com/76979871', 24, 2, false),
    (s3, c_marca, 'Manual de marca exprés',             'Documenta tu sistema en una página.',               'https://vimeo.com/76979871', 18, 1, false),
    (s3, c_marca, 'Lanzamiento y pruebas reales',       'Aplicaciones digitales y físicas.',                 'https://vimeo.com/76979871', 26, 2, false);

  INSERT INTO public.sections (course_id, title, position) VALUES (c_letras, 'Anatomía tipográfica', 1)    RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (c_letras, 'Composición y jerarquía', 2) RETURNING id INTO s2;

  INSERT INTO public.lessons (section_id, course_id, title, description, video_url, duration_minutes, position, is_free_preview) VALUES
    (s1, c_letras, 'Las partes de una letra',           'Vocabulario esencial.',                              'https://vimeo.com/76979871', 12, 1, true),
    (s1, c_letras, 'Familias y clasificación',          'Romanas, palo seco, script y más.',                  'https://vimeo.com/76979871', 18, 2, false),
    (s1, c_letras, 'Pareo de tipografías',              'Cómo combinar dos tipos sin pelearse.',              'https://vimeo.com/76979871', 20, 3, false),
    (s2, c_letras, 'Jerarquía visual',                  'Tamaños, pesos y ritmo.',                            'https://vimeo.com/76979871', 22, 1, false),
    (s2, c_letras, 'Tipografía en pantalla',            'Legibilidad para web y app.',                        'https://vimeo.com/76979871', 24, 2, false);

  INSERT INTO public.sections (course_id, title, position) VALUES (c_motion, 'Principios de animación', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (c_motion, 'Motion para marca', 2)       RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (c_motion, 'Entrega y exportación', 3)   RETURNING id INTO s3;

  INSERT INTO public.lessons (section_id, course_id, title, description, video_url, duration_minutes, position, is_free_preview) VALUES
    (s1, c_motion, 'Los 12 principios, hoy',            'Aplicados al motion moderno.',                       'https://vimeo.com/76979871', 18, 1, true),
    (s1, c_motion, 'Easing y timing',                   'Curvas que dan personalidad.',                       'https://vimeo.com/76979871', 22, 2, false),
    (s2, c_motion, 'Identidad en movimiento',           'El logo cobra vida.',                                'https://vimeo.com/76979871', 28, 1, false),
    (s2, c_motion, 'Sistema de transiciones',           'Crea un lenguaje cinético propio.',                  'https://vimeo.com/76979871', 32, 2, false),
    (s3, c_motion, 'Render y formatos',                 'Codecs y calidad para cada canal.',                  'https://vimeo.com/76979871', 16, 1, false);
END
$seed$;
