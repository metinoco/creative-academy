-- ─────────────────────────────────────────────────────────────────────────────
-- 1.4  Q&A y Notas — tablas y RLS para el reproductor de curso
-- ─────────────────────────────────────────────────────────────────────────────

-- ── lesson_notes ─────────────────────────────────────────────────────────────
create table public.lesson_notes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  lesson_id  uuid        not null references public.lessons(id)  on delete cascade,
  body       text        not null default '',
  updated_at timestamptz not null default now()
);

create unique index lesson_notes_user_lesson
  on public.lesson_notes(user_id, lesson_id);

create trigger touch_lesson_notes_updated_at
  before update on public.lesson_notes
  for each row execute function public.touch_updated_at();

alter table public.lesson_notes enable row level security;

create policy "users manage own notes"
  on public.lesson_notes for all
  using   (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "admins manage all notes"
  on public.lesson_notes for all
  using (public.has_role(auth.uid(), 'admin'));

-- ── lesson_questions ──────────────────────────────────────────────────────────
create table public.lesson_questions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  lesson_id   uuid        not null references public.lessons(id)  on delete cascade,
  course_id   uuid        not null references public.courses(id)  on delete cascade,
  body        text        not null,
  votes_count integer     not null default 0 check (votes_count >= 0),
  created_at  timestamptz not null default now()
);

create index lesson_questions_lesson_id on public.lesson_questions(lesson_id);

alter table public.lesson_questions enable row level security;

create policy "enrolled users read questions"
  on public.lesson_questions for select
  using (
    public.has_role(auth.uid(), 'admin') or
    public.has_course_access(auth.uid(), course_id)
  );

create policy "enrolled users insert questions"
  on public.lesson_questions for insert
  with check (
    auth.uid() = user_id and
    public.has_course_access(auth.uid(), course_id)
  );

create policy "admins manage questions"
  on public.lesson_questions for all
  using (public.has_role(auth.uid(), 'admin'));

-- ── lesson_answers ────────────────────────────────────────────────────────────
create table public.lesson_answers (
  id                   uuid        primary key default gen_random_uuid(),
  question_id          uuid        not null references public.lesson_questions(id) on delete cascade,
  user_id              uuid        not null references public.profiles(id)         on delete cascade,
  body                 text        not null,
  is_instructor_answer boolean     not null default false,
  created_at           timestamptz not null default now()
);

create index lesson_answers_question_id on public.lesson_answers(question_id);

alter table public.lesson_answers enable row level security;

create policy "enrolled users read answers"
  on public.lesson_answers for select
  using (
    public.has_role(auth.uid(), 'admin') or
    exists (
      select 1 from public.lesson_questions lq
      where lq.id = question_id
        and public.has_course_access(auth.uid(), lq.course_id)
    )
  );

create policy "enrolled users insert answers"
  on public.lesson_answers for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.lesson_questions lq
      where lq.id = question_id
        and public.has_course_access(auth.uid(), lq.course_id)
    )
  );

create policy "admins manage answers"
  on public.lesson_answers for all
  using (public.has_role(auth.uid(), 'admin'));

-- ── lesson_question_votes ─────────────────────────────────────────────────────
create table public.lesson_question_votes (
  id          uuid        primary key default gen_random_uuid(),
  question_id uuid        not null references public.lesson_questions(id) on delete cascade,
  user_id     uuid        not null references public.profiles(id)         on delete cascade,
  created_at  timestamptz not null default now(),
  constraint uq_question_user_vote unique(question_id, user_id)
);

alter table public.lesson_question_votes enable row level security;

create policy "users manage own votes"
  on public.lesson_question_votes for all
  using   (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── toggle_question_vote RPC ──────────────────────────────────────────────────
create or replace function public.toggle_question_vote(p_question_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_already_voted boolean;
  v_new_count     integer;
begin
  select exists(
    select 1 from public.lesson_question_votes
    where question_id = p_question_id
      and user_id = auth.uid()
  ) into v_already_voted;

  if v_already_voted then
    delete from public.lesson_question_votes
    where question_id = p_question_id and user_id = auth.uid();

    update public.lesson_questions
       set votes_count = greatest(votes_count - 1, 0)
     where id = p_question_id
    returning votes_count into v_new_count;
  else
    insert into public.lesson_question_votes(question_id, user_id)
    values (p_question_id, auth.uid())
    on conflict do nothing;

    update public.lesson_questions
       set votes_count = votes_count + 1
     where id = p_question_id
    returning votes_count into v_new_count;
  end if;

  return jsonb_build_object(
    'voted',       not v_already_voted,
    'votes_count', coalesce(v_new_count, 0)
  );
end;
$$;
