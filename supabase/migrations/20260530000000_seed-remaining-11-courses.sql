-- Seed secciones y lecciones para los 11 cursos sin contenido.
-- Estructura y conteos de lecciones fieles a courses.ts.
-- Idempotente: solo inserta si el curso no tiene secciones aún.

DO $$
DECLARE
  cid uuid;
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid;
BEGIN

-- ════════════════════════════════════════════════════════════
-- scroll-stop  (Social media · Pablo Soler · 4 sec · 28 lec)
-- ════════════════════════════════════════════════════════════
SELECT id INTO cid FROM public.courses WHERE slug = 'scroll-stop';
IF cid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.sections WHERE course_id = cid) THEN

  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Estrategia y audiencia', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Diseño visual para redes', 2) RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Copywriting y hooks', 3) RETURNING id INTO s3;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Planificación y métricas', 4) RETURNING id INTO s4;

  INSERT INTO public.lessons (section_id, course_id, title, position, duration_minutes, is_free_preview, content) VALUES
    (s1, cid, 'Bienvenida y visión del curso',          1,  8, true,  'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Define tu nicho y audiencia',            2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Arquetipos de contenido',                3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Mapa de pilares de contenido',           4, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Análisis de la competencia',             5, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Tu propuesta de valor única',            6, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Principios de diseño para social',       1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Tu paleta y tipografías de marca',       2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Templates en Canva o Figma',             3, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Carruseles y posts estáticos',           4, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Diseño vertical: Stories y Reels',       5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Coherencia visual en el feed',           6, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Portadas y thumbnails',                  7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Mockups y presentación de marca',        8, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'El hook perfecto en 3 segundos',         1, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Estructura del copy de valor',           2, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'CTAs que generan acción',                3, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Copy para pie de foto',                  4, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Guiones para vídeo corto',               5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Storytelling en formato corto',          6, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Voz de marca y tono de comunicación',    7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'El calendario editorial semanal',        1, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Herramientas de planificación',          2, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Batch content: graba en un día',         3, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Métricas que importan de verdad',        4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Leer datos para mejorar',                5, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Iteración basada en resultados',         6, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Escala sin perder tu identidad',         7, 14, false, 'Notas y recursos de apoyo para esta lección.');

END IF;

-- ════════════════════════════════════════════════════════════
-- riso-postal  (Print · Tomás Vidal · 4 sec · 22 lec)
-- ════════════════════════════════════════════════════════════
SELECT id INTO cid FROM public.courses WHERE slug = 'riso-postal';
IF cid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.sections WHERE course_id = cid) THEN

  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Qué es la Risograph', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Preparación de archivos', 2) RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Diseño para Riso', 3) RETURNING id INTO s3;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Tu primera edición', 4) RETURNING id INTO s4;

  INSERT INTO public.lessons (section_id, course_id, title, position, duration_minutes, is_free_preview, content) VALUES
    (s1, cid, 'Bienvenida y el mundo Riso',                 1,  8, true,  'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Historia y estética de la risografía',       2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Cómo funciona la máquina',                   3, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Tintas, papeles y posibilidades',            4, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Separación de capas por tinta',              1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Paleta Riso: los colores reales',            2, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Configurar Illustrator o InDesign',          3, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Tramas y half-tones para Riso',              4, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Transparencias y overprinting',              5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Exportar archivos correctamente',            6, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Pensar en dos o tres tintas',                1, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'El error como recurso creativo',             2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Misregistration intencional',                3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Texturas analógicas en digital',             4, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Tipografía que aguanta la Riso',             5, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Composición para postal',                    6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Diseño de un fanzine de 8 páginas',          7, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Briefing con la imprenta',                   1, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Pruebas y ajustes finales',                  2, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Supervisar la impresión',                    3, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Acabados: plegado y corte',                  4, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Lanza tu edición limitada',                  5, 14, false, 'Notas y recursos de apoyo para esta lección.');

END IF;

-- ════════════════════════════════════════════════════════════
-- barro-torno  (Cerámica · Elena Sáez · 4 sec · 36 lec)
-- ════════════════════════════════════════════════════════════
SELECT id INTO cid FROM public.courses WHERE slug = 'barro-torno';
IF cid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.sections WHERE course_id = cid) THEN

  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'El barro y el torno', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Formas básicas', 2) RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Decoración y acabados', 3) RETURNING id INTO s3;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Cocción y resultado final', 4) RETURNING id INTO s4;

  INSERT INTO public.lessons (section_id, course_id, title, position, duration_minutes, is_free_preview, content) VALUES
    (s1, cid, 'Bienvenida al mundo cerámico',               1,  8, true,  'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Tipos de barro y sus propiedades',           2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Acondicionamiento y amasado',                3, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Conoce tu torno',                            4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Seguridad y postura en el taller',           5, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Primeros contactos con el barro húmedo',     6, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Ejercicios de tacto y presión',              7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Centrado: el desafío inicial',               1, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Técnica de centrado paso a paso',            2, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Apertura de la pieza',                       3, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Subida de paredes',                          4, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Forma de un cuenco bajo',                    5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Forma de un cuenco profundo',                6, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Taza con asa',                               7, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Cilindro recto',                             8, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Vasija con cuello',                          9, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Corrección de defectos comunes',            10, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Recorte y perfilado en cuero',               1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Engobes: mezcla y aplicación',               2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Esgrafiado y texturas',                      3, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Técnica de wax resist',                      4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Esmaltes: tipos y propiedades',              5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Aplicación de esmalte a brocha',             6, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Esmaltado por inmersión',                    7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Combinaciones de esmaltes',                  8, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Preparación para el horno',                  9, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Decoración final y firmar tu obra',         10, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'El horno eléctrico: ciclos y temperaturas',  1, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Bizcocho o primera cocción',                 2, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Carga correcta del horno',                   3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Cocción de gres y porcelana',                4, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Abriendo el horno: el momento de verdad',    5, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Errores más comunes y cómo evitarlos',       6, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Lectura del resultado: glaseados y colores', 7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Pulido y acabado final',                     8, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Tu primera colección terminada',             9, 14, false, 'Notas y recursos de apoyo para esta lección.');

END IF;

-- ════════════════════════════════════════════════════════════
-- agua-pigmento  (Pintura · Nicolás Prado · 4 sec · 30 lec)
-- ════════════════════════════════════════════════════════════
SELECT id INTO cid FROM public.courses WHERE slug = 'agua-pigmento';
IF cid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.sections WHERE course_id = cid) THEN

  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Materiales y primeros pasos', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Técnicas fundamentales', 2) RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Color y composición', 3) RETURNING id INTO s3;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Proyectos completos', 4) RETURNING id INTO s4;

  INSERT INTO public.lessons (section_id, course_id, title, position, duration_minutes, is_free_preview, content) VALUES
    (s1, cid, 'Bienvenida a la acuarela suelta',          1,  8, true,  'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Pinceles, papeles y pigmentos',            2, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Tu paleta de trabajo',                     3, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Agua y pigmento: el equilibrio',           4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Primera pincelada sin miedo',              5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Ejercicios de pincel libre',               6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Aguadas planas y uniformes',               1, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Gradientes de color',                      2, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Mojado sobre mojado (wet-on-wet)',          3, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Mojado sobre seco (wet-on-dry)',            4, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Reservas con cera y máscara',              5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Salpicados y texturas libres',             6, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Capas y transparencias',                   7, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Control del borde: duro y suave',          8, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Teoría del color para acuarelistas',       1, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Temperatura y armonías cromáticas',        2, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Mezclas directas en el papel',             3, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Composición con paleta limitada',          4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Luz y sombra en acuarela',                 5, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Perspectiva atmosférica',                  6, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Fondos sueltos y gestualidad',             7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Boceto antes de pintar',                   8, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'El valor tonal como guía',                 9, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Botanical: hoja con detalle',              1, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Paisaje de agua y cielo',                  2, 24, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Retrato en acuarela suelta',               3, 26, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Composición floral libre',                 4, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Escena urbana con gestualidad',            5, 24, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Serie de postales',                        6, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Proyecto final y reflexión',               7, 14, false, 'Notas y recursos de apoyo para esta lección.');

END IF;

-- ════════════════════════════════════════════════════════════
-- luz-grano  (Fotografía · Aitana Bosch · 4 sec · 40 lec)
-- ════════════════════════════════════════════════════════════
SELECT id INTO cid FROM public.courses WHERE slug = 'luz-grano';
IF cid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.sections WHERE course_id = cid) THEN

  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'La cámara analógica y la película', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Exposición y composición', 2) RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'El laboratorio fotográfico', 3) RETURNING id INTO s3;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Digitalización y proyecto', 4) RETURNING id INTO s4;

  INSERT INTO public.lessons (section_id, course_id, title, position, duration_minutes, is_free_preview, content) VALUES
    (s1, cid, 'Bienvenida al analógico',                          1,  8, true,  'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Tipos de cámaras de 35mm',                        2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'El obturador, el diafragma y el ISO',             3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Películas negativas en color',                    4, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Películas en blanco y negro',                     5, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Cargar el carrete sin velar',                     6, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Lectura del fotómetro integrado',                 7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Primeras fotos del carrete',                      8, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'El triángulo de exposición en analógico',         1, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Medir la luz: fotómetro y zona system',           2, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Subexposición y sobreexposición creativa',        3, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Composición: regla de tercios y más',             4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Profundidad de campo con diafragma',              5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Velocidad de obturación y movimiento',            6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Retrato con luz natural',                         7, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Fotografía callejera (street photography)',       8, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Paisaje analógico',                               9, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Usar el flash analógico',                        10, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Introducción al cuarto oscuro',                   1, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Materiales para el revelado',                     2, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Preparar los químicos',                           3, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Revelado del negativo en B/N paso a paso',        4, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Tiempos y temperatura: precisión',                5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Lavado y secado del negativo',                    6, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Leer el negativo a la lupa',                      7, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'El ampliador y la hoja de contactos',             8, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'De negativo a papel: la ampliación',              9, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Revelado del papel fotográfico',                 10, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Virado y acabado de la copia',                   11, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Archivado de negativos y copias',                12, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Escáner de negativos: qué y cómo',               1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Configurar el escáner plano o dedicado',          2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Revelar el RAW del escaneo',                      3, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Retoque mínimo: respetar el grano',               4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Exportar para redes y para impresión',            5, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Maqueta de fotolibro',                            6, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Edición de una serie coherente',                  7, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Secuencia y ritmo visual',                        8, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Imprimir tu proyecto',                            9, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Presentación final de tu trabajo',               10, 14, false, 'Notas y recursos de apoyo para esta lección.');

END IF;

-- ════════════════════════════════════════════════════════════
-- pluma-tinta  (Lettering · Joel Marín · 4 sec · 26 lec)
-- ════════════════════════════════════════════════════════════
SELECT id INTO cid FROM public.courses WHERE slug = 'pluma-tinta';
IF cid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.sections WHERE course_id = cid) THEN

  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Herramientas y fundamentos', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Caligrafía base', 2) RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Lettering de diseño', 3) RETURNING id INTO s3;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Digitalización y proyecto', 4) RETURNING id INTO s4;

  INSERT INTO public.lessons (section_id, course_id, title, position, duration_minutes, is_free_preview, content) VALUES
    (s1, cid, 'Bienvenida al lettering a mano',               1,  8, true,  'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Materiales: plumas, brush pens y tinta',       2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Postura, presión y control',                   3, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Líneas guía y ángulo de escritura',            4, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Trazos básicos: ascendentes y descendentes',   5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'El alfabeto minúscula paso a paso',            1, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'El alfabeto mayúscula',                        2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Conexiones entre letras',                      3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Inclinación y ritmo caligráfico',              4, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Variaciones de peso: fino y grueso',           5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Velocidad y fluidez',                          6, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Caligrafía aplicada a tarjetas',               7, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'De la caligrafía al lettering de diseño',      1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Boceto con lápiz antes de tinta',              2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Lettering de palo: sans serif a mano',         3, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Lettering display con personalidad',           4, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Composición tipográfica con frase corta',      5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Efectos: sombra, outline e inline',            6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Mezcla de estilos en una pieza',               7, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Lettering para branding real',                 8, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Escaner o foto con luz correcta',              1, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Vectorizar en Illustrator',                    2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Limpiar y refinar el trazo digital',           3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Aplicar color al lettering digital',           4, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Adaptar para distintos formatos',              5, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Pieza final lista para cliente',               6, 16, false, 'Notas y recursos de apoyo para esta lección.');

END IF;

-- ════════════════════════════════════════════════════════════
-- volumen-render  (3D · Sara Quintana · 5 sec · 58 lec)
-- ════════════════════════════════════════════════════════════
SELECT id INTO cid FROM public.courses WHERE slug = 'volumen-render';
IF cid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.sections WHERE course_id = cid) THEN

  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Interfaz y modelado básico', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Materiales e iluminación', 2) RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Modelado avanzado', 3) RETURNING id INTO s3;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Animación y render', 4) RETURNING id INTO s4;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Proyecto y postproducción', 5) RETURNING id INTO s5;

  INSERT INTO public.lessons (section_id, course_id, title, position, duration_minutes, is_free_preview, content) VALUES
    (s1, cid, 'Bienvenida a Cinema 4D',                      1,  8, true,  'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'La interfaz: paneles y viewports',            2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Atajos esenciales',                           3, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Primitivas y objetos básicos',                4, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Transformaciones: mover, rotar, escalar',     5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'El gestor de objetos y la jerarquía',         6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Subdivisión de superficies',                  7, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Extrusión y bisel',                           8, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Modelado con splines y loft',                 9, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Boole y operaciones lógicas',                10, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Symmetry y cloner',                          11, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Exportar e importar geometría',              12, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'El sistema de materiales en C4D',             1, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Canal de color, reflexión y roughness',       2, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Texturas UV: unwrap básico',                  3, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Materiales metálicos y plásticos',            4, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Vidrio, agua y materiales transparentes',     5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Materiales procedurales con noise',           6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Iluminación three-point en estudio',          7, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Luz área y suavidad de sombras',              8, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'HDRI para iluminación de entorno',            9, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Sky y luz física exterior',                  10, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Iluminación de producto',                    11, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Render preview vs render final',             12, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Modelado poligonal: vértices y aristas',      1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Loop cuts y edge flow',                       2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Modelado orgánico: personaje simple',         3, 24, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Sculpting básico en C4D',                     4, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Cuerpos de revolución con lathe',             5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Barrido o sweep',                             6, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Modelado arquitectónico simple',              7, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Deformadores y modifier stack',               8, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Wrap y proyección de malla',                  9, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Retopología básica',                         10, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Instancias y duplicados eficientes',         11, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Baking de normales',                         12, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Nivel de detalle (LOD)',                     13, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Pieza compleja de modelado',                 14, 26, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'El timeline de C4D',                          1, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Keyframes y curvas de animación',             2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Animación de objetos y cámaras',              3, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Animación de materiales y color',             4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Effector y cloner animados',                  5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Dynamics: simulación de física',              6, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Simulación de telas',                         7, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Partículas básicas',                          8, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Configurar Redshift en C4D',                  9, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'AOVs y passes de render',                    10, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Optimizar el tiempo de render',              11, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Batch render y gestión de frames',           12, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Concept y planning del proyecto final',       1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Modelado de la pieza principal',              2, 28, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Materiales y texturizado final',              3, 24, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Iluminación definitiva',                      4, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Animación de cámara',                         5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Render de alta calidad',                      6, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Composición en After Effects',                7, 24, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Exportar y entregar el proyecto',             8, 16, false, 'Notas y recursos de apoyo para esta lección.');

END IF;

-- ════════════════════════════════════════════════════════════
-- interfaces-vivas  (UX/UI · Diego Aranda · 5 sec · 54 lec)
-- ════════════════════════════════════════════════════════════
SELECT id INTO cid FROM public.courses WHERE slug = 'interfaces-vivas';
IF cid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.sections WHERE course_id = cid) THEN

  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'UX research y discovery', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Arquitectura e information design', 2) RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Diseño de componentes en Figma', 3) RETURNING id INTO s3;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Prototipado y tests de usabilidad', 4) RETURNING id INTO s4;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Handoff y métricas de producto', 5) RETURNING id INTO s5;

  INSERT INTO public.lessons (section_id, course_id, title, position, duration_minutes, is_free_preview, content) VALUES
    (s1, cid, 'Bienvenida: diseño desde producto',             1,  8, true,  'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Qué es UX y por qué importa',                  2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Métodos de investigación de usuarios',          3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Entrevistas en profundidad',                    4, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Encuestas y análisis cuantitativo',             5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Mapa de empatía',                               6, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Jobs To Be Done',                               7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Síntesis de research: affinity mapping',        8, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Personas y arquetipos de usuario',              9, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Definir el problema: how might we',            10, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Arquitectura de información (IA)',              1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Card sorting y árbol de contenidos',            2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'User flows y task flows',                       3, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Site maps y navigation design',                 4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Patrones de UX: fundamentos',                   5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Diseño de formularios que funcionan',           6, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Empty states y estados de error',               7, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Microinteracciones y feedback',                 8, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Accesibilidad: principios WCAG',                9, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Contenido y UX writing',                       10, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Setup de Figma para proyectos reales',          1, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Variables y tokens de diseño',                  2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Auto layout dominado',                          3, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Componentes y variantes',                       4, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Diseño de botones y CTA',                       5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Formularios e inputs',                          6, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Tarjetas y listas',                             7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Navegación: nav, tabs, sidebar',                8, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Modales, drawers y toasts',                     9, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Sistema de iconografía',                       10, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Data display: tablas y gráficos',              11, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Atomic design en la práctica',                 12, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Documentación del Design System',              13, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Handoff a desarrollo con Figma',               14, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Prototipado de baja fidelidad',                 1, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Prototipado de alta fidelidad en Figma',        2, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Animaciones y transiciones',                    3, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Diseño de escenarios de test',                  4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Test de usabilidad: guión y moderación',        5, 22, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Test en remoto con herramientas digitales',     6, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Análisis de resultados cualitativos',           7, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Métricas de usabilidad (SUS, SUPR-Q)',          8, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Iteración basada en hallazgos',                 9, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Caso de estudio: de 0 a prototipo',            10, 24, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Preparar archivos para desarrollo',             1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Specs y anotaciones en Figma',                  2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Colaboración con el equipo de frontend',        3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'QA del producto lanzado',                       4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Analytics: Google Analytics y Mixpanel',        5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Heatmaps con Hotjar',                           6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Funnel de conversión',                          7, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'A/B testing para diseño',                       8, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'NPS y feedback post-lanzamiento',               9, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Tu portfolio de UX/UI',                        10, 20, false, 'Notas y recursos de apoyo para esta lección.');

END IF;

-- ════════════════════════════════════════════════════════════
-- plano-secuencia  (Vídeo · Marta Esteve · 5 sec · 46 lec)
-- ════════════════════════════════════════════════════════════
SELECT id INTO cid FROM public.courses WHERE slug = 'plano-secuencia';
IF cid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.sections WHERE course_id = cid) THEN

  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'La cámara y sus controles', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Composición y lenguaje visual', 2) RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Iluminación y sonido', 3) RETURNING id INTO s3;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Edición narrativa en Premiere', 4) RETURNING id INTO s4;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Color y exportación', 5) RETURNING id INTO s5;

  INSERT INTO public.lessons (section_id, course_id, title, position, duration_minutes, is_free_preview, content) VALUES
    (s1, cid, 'Bienvenida al vídeo con DSLR',                  1,  8, true,  'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Tu cámara: anatomía y menús',                   2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Modo manual: ISO, obturación, apertura',        3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'El sensor y el formato de grabación',           4, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Objetivos para vídeo',                          5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Estabilización: trípode, slider y gimbal',      6, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Audio: micrófono integrado vs externo',         7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Monitor externo y visualización',               8, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Los planos cinematográficos',                   1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'La regla de los tercios en vídeo',              2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Líneas y geometría como guía',                  3, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Profundidad y planos de foco',                  4, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'El eje de acción y el raccord',                 5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Plano contraplano',                             6, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Transiciones narrativas',                       7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Movimiento de cámara con propósito',            8, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'El plano secuencia',                            9, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Estética y referentes visuales',               10, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'La luz natural: hora dorada y azul',            1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Interior con ventana como fuente',              2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Tres puntos de luz: esquema básico',            3, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Luz continua vs flash de vídeo',                4, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Modificadores: difusores y rebotadores',        5, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Iluminación de entrevista',                     6, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Iluminación de escena y acción',                7, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Nocturno y luz disponible',                     8, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Color de luz: temperatura y mezclas',           9, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'El micrófono de cañón',                        10, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'El lavalier o micrófono de solapa',            11, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Grabación de ambient y foley',                 12, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Flujo de trabajo en Premiere Pro',              1, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Organización de media y bins',                  2, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'El corte primario: ritmo y selección',          3, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Cortes de inserción y cutaway',                 4, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Raccord de acción y de dirección',              5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Música y efectos de sonido',                    6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Diseño de sonido en capas',                     7, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Títulos y gráficos en Premiere',                8, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Exportar para YouTube, Vimeo y web',            9, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Organizar el proyecto para entregar',          10, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'El color en vídeo: espacio y gamma',            1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Corrección primaria en Lumetri',                2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Look cinematográfico con curvas',               3, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Gradación por escenas',                         4, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Exportar en H.264 y H.265',                     5, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s5, cid, 'Tu pieza final lista para publicar',            6, 16, false, 'Notas y recursos de apoyo para esta lección.');

END IF;

-- ════════════════════════════════════════════════════════════
-- ondas-podcast  (Audio · Rubén Lago · 4 sec · 28 lec)
-- ════════════════════════════════════════════════════════════
SELECT id INTO cid FROM public.courses WHERE slug = 'ondas-podcast';
IF cid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.sections WHERE course_id = cid) THEN

  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Setup y equipo de grabación', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Grabación y locución', 2) RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Edición y masterización', 3) RETURNING id INTO s3;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Publicación y comunidad', 4) RETURNING id INTO s4;

  INSERT INTO public.lessons (section_id, course_id, title, position, duration_minutes, is_free_preview, content) VALUES
    (s1, cid, 'Bienvenida al podcasting',                     1,  8, true,  'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Micrófonos: USB vs XLR',                       2, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Interfaz de audio y grabadoras',               3, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'El espacio de grabación acústico',             4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Conectar y testear el equipo',                 5, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Tu primer test de grabación',                  6, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Estructura del episodio: escaleta',            1, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Técnica de locución y proyección de voz',      2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Cómo sonar natural en el micrófono',           3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Grabación de entrevistas (remoto y presencial)',4, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Gestión de silencios y errores',               5, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Intro, outro y señales de marca',              6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Música libre de derechos',                     7, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Flujo de trabajo en Audacity o Reaper',        1, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Limpieza de ruido de fondo',                   2, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Cortes, fundidos y edición de ritmo',          3, 20, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Compresión y ecualizador para voz',            4, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'La cadena de procesado (chain)',               5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Mezcla de voces y música',                     6, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Masterizar para Spotify: -16 LUFS',            7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Exportar en MP3 y formato correcto',           8, 12, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Plataformas de hosting de podcast',            1, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'RSS y distribución automática',                2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Subir a Spotify, Apple Podcasts e iVoox',      3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Portada, título y descripción SEO',            4, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Estrategia de lanzamiento: 3 primeros episodios', 5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Crear comunidad alrededor del podcast',        6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Monetización y primeros pasos',                7, 14, false, 'Notas y recursos de apoyo para esta lección.');

END IF;

-- ════════════════════════════════════════════════════════════
-- narrativa-creativa  (Escritura · Clara Vives · 4 sec · 34 lec)
-- ════════════════════════════════════════════════════════════
SELECT id INTO cid FROM public.courses WHERE slug = 'narrativa-creativa';
IF cid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.sections WHERE course_id = cid) THEN

  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'La idea y el personaje', 1) RETURNING id INTO s1;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Estructura y arco narrativo', 2) RETURNING id INTO s2;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Técnicas de prosa', 3) RETURNING id INTO s3;
  INSERT INTO public.sections (course_id, title, position) VALUES (cid, 'Revisión y proyecto final', 4) RETURNING id INTO s4;

  INSERT INTO public.lessons (section_id, course_id, title, position, duration_minutes, is_free_preview, content) VALUES
    (s1, cid, 'Bienvenida: por qué contamos historias',       1,  8, true,  'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'De dónde vienen las ideas',                    2, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'La semilla de la historia',                    3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'Personajes que respiran',                      4, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'El deseo y el defecto del protagonista',       5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'El antagonista como espejo',                   6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s1, cid, 'El mundo que rodea al personaje',              7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'La estructura: por qué existe',                1, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'El incidente incitador',                       2, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Estructura en tres actos',                     3, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'El viaje del héroe actualizado',               4, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'El punto de giro y la crisis',                 5, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'El clímax y la resolución',                    6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Estructura de capítulo y escena',              7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'Sub-tramas y tramas secundarias',              8, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s2, cid, 'El final que cierra y abre',                   9, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'La voz narrativa y el punto de vista',         1, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Primera vs tercera persona',                   2, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Narrador omnisciente vs limitado',             3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'El diálogo que avanza',                        4, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Escribir el tiempo: escena vs sumario',        5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'El detalle concreto vs la abstracción',        6, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Ritmo de frase y párrafo',                     7, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Show don''t tell en la práctica',              8, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Metáfora y lenguaje figurado con criterio',    9, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s3, cid, 'Atmósfera y sentido del lugar',               10, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'La primera revisión: leer como extraño',        1, 18, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Estructura y ritmo: la revisión macro',         2, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Prosa y estilo: la revisión micro',             3, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Cortar sin piedad: el exceso',                  4, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'El feedback de lectores beta',                  5, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Preparar el texto para publicar',               6, 14, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Formatos de publicación: ebook, papel, web',    7, 16, false, 'Notas y recursos de apoyo para esta lección.'),
    (s4, cid, 'Tu proyecto final presentado',                  8, 18, false, 'Notas y recursos de apoyo para esta lección.');

END IF;

END $$;

-- Sincronizar lessons_count con la realidad para los 11 cursos recién poblados
UPDATE public.courses c
SET lessons_count = sub.cnt
FROM (
  SELECT course_id, COUNT(*)::int AS cnt
  FROM public.lessons
  GROUP BY course_id
) sub
WHERE sub.course_id = c.id
  AND c.slug IN (
    'scroll-stop','riso-postal','barro-torno','agua-pigmento','luz-grano',
    'pluma-tinta','volumen-render','interfaces-vivas','plano-secuencia',
    'ondas-podcast','narrativa-creativa'
  );
