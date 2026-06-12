-- FitCoach Pro — push notifications também para alunos
-- Rode no SQL Editor e depois REGENERE OS TIPOS.

alter table public.push_subscriptions
  alter column trainer_id drop not null;

alter table public.push_subscriptions
  add column if not exists aluno_id uuid references public.alunos on delete cascade;

alter table public.push_subscriptions
  add constraint push_dono check (
    (trainer_id is not null and aluno_id is null) or
    (trainer_id is null and aluno_id is not null)
  );

create policy "aluno gerencia push" on public.push_subscriptions
  for all using (exists (
    select 1 from public.alunos a where a.id = aluno_id and a.user_id = auth.uid()))
  with check (exists (
    select 1 from public.alunos a where a.id = aluno_id and a.user_id = auth.uid()));
