
-- Seed sections + lessons for the 13 remaining courses, then enroll Carlos with progress.

DO $$
DECLARE
  v_course RECORD;
  v_section_id uuid;
  v_secs text[];
  v_lessons text[];
  i int;
  j int;
  v_pos int;
  v_dur int;
BEGIN
  FOR v_course IN
    SELECT id, slug FROM public.courses
    WHERE slug IN (
      'agua-pigmento','barro-torno','interfaces-vivas','luz-grano','narrativa-creativa',
      'ondas-podcast','papel-rejilla','plano-secuencia','pluma-tinta','riso-postal',
      'scroll-stop','trazos-pixel','volumen-render'
    )
  LOOP
    -- Choose section names per course
    v_secs := CASE v_course.slug
      WHEN 'agua-pigmento'    THEN ARRAY['Materiales y primer trazo','Color y aguada','Composición final']
      WHEN 'barro-torno'      THEN ARRAY['El barro y el torno','Centrado y subida','Esmalte y cocción']
      WHEN 'interfaces-vivas' THEN ARRAY['Research y flows','Wireframes y UI','Prototipo y handoff']
      WHEN 'luz-grano'        THEN ARRAY['Cámara analógica','Exposición y revelado','Edición de un fotolibro']
      WHEN 'narrativa-creativa' THEN ARRAY['La idea y el conflicto','Estructura narrativa','Voz y publicación']
      WHEN 'ondas-podcast'    THEN ARRAY['Concepto y formato','Grabación y edición','Publicación y crecimiento']
      WHEN 'papel-rejilla'    THEN ARRAY['Sistema editorial','Tipografía y rejilla','Maqueta final']
      WHEN 'plano-secuencia'  THEN ARRAY['Cámara y exposición','Lenguaje audiovisual','Postproducción']
      WHEN 'pluma-tinta'      THEN ARRAY['Trazo y caligrafía','Composición lettering','Acabado y digitalizado']
      WHEN 'riso-postal'      THEN ARRAY['Risografía esencial','Diseño para tinta plana','Imprimir tu serie']
      WHEN 'scroll-stop'      THEN ARRAY['Hooks y formato vertical','Edición rápida','Distribución y métricas']
      WHEN 'trazos-pixel'     THEN ARRAY['Procreate desde cero','Color y luz','Ilustración final']
      WHEN 'volumen-render'   THEN ARRAY['Modelado básico','Materiales e iluminación','Render y composición']
    END;

    v_lessons := CASE v_course.slug
      WHEN 'agua-pigmento' THEN ARRAY[
        'Bienvenida y materiales','Pinceladas básicas','Mezclas en paleta','Primer estudio de hoja',
        'Aguadas planas y degradados','Mojado sobre mojado','Texturas y salpicados','Paleta limitada',
        'Boceto y planificación','Composición de naturaleza','Detalles y contrastes','Acabado y firma'
      ]
      WHEN 'barro-torno' THEN ARRAY[
        'Bienvenida al torno','Tipos de barro','Preparación y amasado','Primer contacto con el torno',
        'Centrado de la pieza','Apertura y subida','Forma de un cuenco','Forma de una taza',
        'Bizcochado','Esmaltado básico','Cocción y horno','Pieza terminada'
      ]
      WHEN 'interfaces-vivas' THEN ARRAY[
        'Bienvenida al producto','Entrevistas con usuarios','Mapa de empatía','User flows',
        'Wireframes en baja','Sistemas de UI','Componentes y tokens','Prototipo en Figma',
        'Tests con usuarios','Iteración del diseño','Handoff a desarrollo','Caso de estudio'
      ]
      WHEN 'luz-grano' THEN ARRAY[
        'Bienvenida analógica','Tu cámara paso a paso','Carga del carrete','Triángulo de exposición',
        'Composición a contraluz','Retrato analógico','Revelado en B/N','Escaneado del negativo',
        'Edición del contacto','Selección final','Maqueta de fotolibro','Imprime tu serie'
      ]
      WHEN 'narrativa-creativa' THEN ARRAY[
        'Por qué contamos historias','Tu voz como autor','Idea y premisa','Construcción del conflicto',
        'Estructura en tres actos','Personajes memorables','Diálogos que suenan','Escena y ritmo',
        'Reescritura disciplinada','Edición final','Publicación y formatos','Lleva tu historia al mundo'
      ]
      WHEN 'ondas-podcast' THEN ARRAY[
        'Bienvenida al podcasting','Tu nicho y formato','Equipo casero','Plan editorial',
        'Guion del episodio','Grabación limpia','Edición en Reaper','Mezcla y loudness',
        'Música y branding sonoro','Publicación y RSS','Promoción del lanzamiento','Métricas y crecimiento'
      ]
      WHEN 'papel-rejilla' THEN ARRAY[
        'Editorial hoy','Conceptualizar la pieza','Formato y márgenes','Rejilla modular',
        'Jerarquía tipográfica','Pares tipográficos','Color y estilo gráfico','Maquetar la portada',
        'Maquetar interiores','Imágenes y pies','Pre-print y exportación','Pieza final'
      ]
      WHEN 'plano-secuencia' THEN ARRAY[
        'Bienvenida al vídeo','Tu DSLR y objetivos','Exposición manual','Sonido en cámara',
        'Encuadres esenciales','Movimiento de cámara','Iluminación natural','Iluminación con luz fija',
        'Flujo de archivos','Edición en Premiere','Color y look','Exporta tu pieza'
      ]
      WHEN 'pluma-tinta' THEN ARRAY[
        'Bienvenida al lettering','Materiales y postura','Trazos básicos','Anatomía de la letra',
        'Cursivas y scripts','Composición de palabra','Bocetos y pruebas','Contraste y peso',
        'Pieza con quote','Acabado a tinta','Digitalizar tu lettering','Pieza final lista'
      ]
      WHEN 'riso-postal' THEN ARRAY[
        'Qué es la risografía','Tu paleta de tintas','Diseño por capas','Tramas y texturas',
        'Preparar archivos','Pruebas en máquina','Registro de capas','Imprimir una postal',
        'Imprimir un fanzine','Encuadernación simple','Acabado y empaque','Lanza tu serie'
      ]
      WHEN 'scroll-stop' THEN ARRAY[
        'Bienvenida creator','Hooks que retienen','Guion de 30 segundos','Grabar con tu móvil',
        'Iluminación rápida','Edición en CapCut','Subtítulos que venden','Música y ritmo',
        'Publicar en Reels y Tiktok','Calendario semanal','Lectura de métricas','Construye tu marca'
      ]
      WHEN 'trazos-pixel' THEN ARRAY[
        'Bienvenida a Procreate','Pinceles esenciales','Capas y máscaras','Boceto desde cero',
        'Color con propósito','Luces y sombras','Texturas y grano','Composición ilustrada',
        'Personaje paso a paso','Escena ambientada','Exportar y formatos','Tu portfolio'
      ]
      WHEN 'volumen-render' THEN ARRAY[
        'Bienvenida a Cinema 4D','Interfaz y atajos','Modelado por primitivas','Modelado por splines',
        'Topología limpia','Materiales y UVs','Iluminación de estudio','HDRIs y exteriores',
        'Cámara y lentes','Render con Redshift','Comp en After Effects','Pieza final lista'
      ]
    END;

    FOR i IN 1..3 LOOP
      INSERT INTO public.sections (course_id, title, position)
      VALUES (v_course.id, v_secs[i], i)
      RETURNING id INTO v_section_id;

      FOR j IN 1..4 LOOP
        v_pos := (i-1)*4 + j;
        v_dur := 5 + ((v_pos * 7) % 18);
        INSERT INTO public.lessons (
          section_id, course_id, title, position, duration_minutes,
          is_free_preview, content
        ) VALUES (
          v_section_id, v_course.id, v_lessons[v_pos], v_pos, v_dur,
          v_pos <= 2,
          'Notas y recursos de apoyo para esta lección.'
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Sync lessons_count with reality for ALL courses
UPDATE public.courses c
SET lessons_count = sub.cnt
FROM (SELECT course_id, COUNT(*)::int AS cnt FROM public.lessons GROUP BY course_id) sub
WHERE sub.course_id = c.id;

-- Enroll Carlos in 3 courses and add lesson progress
DO $$
DECLARE
  v_carlos uuid := '3637d44d-882a-459e-bd13-74cefce11f07';
  v_course_id uuid;
  v_slug text;
  v_n_complete int;
  v_lesson RECORD;
  v_count int;
BEGIN
  FOR v_slug, v_n_complete IN
    SELECT * FROM (VALUES ('marca-magnetica', 8), ('letras-vivas', 4), ('movimiento-color', 2)) AS t(s,n)
  LOOP
    SELECT id INTO v_course_id FROM public.courses WHERE slug = v_slug;

    INSERT INTO public.enrollments (user_id, course_id, source, granted_at)
    VALUES (v_carlos, v_course_id, 'manual', now() - interval '20 days')
    ON CONFLICT DO NOTHING;

    v_count := 0;
    FOR v_lesson IN
      SELECT l.id FROM public.lessons l
      JOIN public.sections s ON s.id = l.section_id
      WHERE l.course_id = v_course_id
      ORDER BY s.position, l.position
    LOOP
      EXIT WHEN v_count >= v_n_complete;
      INSERT INTO public.lesson_progress (user_id, course_id, lesson_id, completed, completed_at)
      VALUES (v_carlos, v_course_id, v_lesson.id, true, now() - (v_count || ' days')::interval)
      ON CONFLICT DO NOTHING;
      v_count := v_count + 1;
    END LOOP;
  END LOOP;
END $$;
