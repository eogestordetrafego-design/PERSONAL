-- FitCoach Pro — App do Aluno
-- Rode no SQL Editor e depois REGENERE OS TIPOS.

-- 1. Vínculo aluno ↔ usuário de autenticação
alter table public.alunos
  add column if not exists user_id uuid unique references auth.users on delete set null;

-- 2. Registro de treino concluído (com PSE = esforço percebido 1-10)
create table if not exists public.treino_logs (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos on delete cascade,
  treino_id uuid references public.treinos on delete set null,
  data timestamptz not null default now(),
  pse int check (pse between 1 and 10),
  comentario text
);

-- 3. Cargas/reps executadas por exercício
create table if not exists public.execucoes (
  id uuid primary key default gen_random_uuid(),
  treino_log_id uuid not null references public.treino_logs on delete cascade,
  exercicio_id uuid references public.exercicios on delete set null,
  nome text not null,
  series int,
  reps int,
  carga_kg numeric
);

alter table public.treino_logs enable row level security;
alter table public.execucoes enable row level security;

-- Trainer acessa logs dos seus alunos
create policy "trainer treino_logs" on public.treino_logs
  for all using (exists (select 1 from public.alunos a where a.id = aluno_id and a.trainer_id = auth.uid()))
  with check (exists (select 1 from public.alunos a where a.id = aluno_id and a.trainer_id = auth.uid()));

create policy "trainer execucoes" on public.execucoes
  for all using (exists (
    select 1 from public.treino_logs tl join public.alunos a on a.id = tl.aluno_id
    where tl.id = treino_log_id and a.trainer_id = auth.uid()))
  with check (exists (
    select 1 from public.treino_logs tl join public.alunos a on a.id = tl.aluno_id
    where tl.id = treino_log_id and a.trainer_id = auth.uid()));

-- 4. POLICIES DO ALUNO (somente o necessário)
-- vê o próprio cadastro
create policy "aluno ve proprio cadastro" on public.alunos
  for select using (user_id = auth.uid());

-- vê o perfil público do seu trainer (nome/avatar no chat)
create policy "aluno ve trainer" on public.profiles
  for select using (exists (
    select 1 from public.alunos a where a.trainer_id = profiles.id and a.user_id = auth.uid()));

-- vê as próprias medidas
create policy "aluno ve medidas" on public.medidas
  for select using (exists (
    select 1 from public.alunos a where a.id = aluno_id and a.user_id = auth.uid()));

-- vê os próprios vínculos de treino
create policy "aluno ve vinculos" on public.aluno_treinos
  for select using (exists (
    select 1 from public.alunos a where a.id = aluno_id and a.user_id = auth.uid()));

-- vê os treinos vinculados a ele
create policy "aluno ve treinos" on public.treinos
  for select using (exists (
    select 1 from public.aluno_treinos at_ join public.alunos a on a.id = at_.aluno_id
    where at_.treino_id = treinos.id and a.user_id = auth.uid()));

-- vê os exercícios desses treinos
create policy "aluno ve exercicios" on public.exercicios
  for select using (exists (
    select 1 from public.aluno_treinos at_ join public.alunos a on a.id = at_.aluno_id
    where at_.treino_id = exercicios.treino_id and a.user_id = auth.uid()));

-- vê as próprias sessões
create policy "aluno ve sessoes" on public.sessoes
  for select using (exists (
    select 1 from public.alunos a where a.id = aluno_id and a.user_id = auth.uid()));

-- vê os próprios pagamentos
create policy "aluno ve pagamentos" on public.pagamentos
  for select using (exists (
    select 1 from public.alunos a where a.id = aluno_id and a.user_id = auth.uid()));

-- chat: lê, envia como 'aluno' e marca como lida
create policy "aluno le mensagens" on public.mensagens
  for select using (exists (
    select 1 from public.alunos a where a.id = aluno_id and a.user_id = auth.uid()));

create policy "aluno envia mensagens" on public.mensagens
  for insert with check (autor = 'aluno' and exists (
    select 1 from public.alunos a where a.id = aluno_id and a.user_id = auth.uid()));

create policy "aluno marca lida" on public.mensagens
  for update using (exists (
    select 1 from public.alunos a where a.id = aluno_id and a.user_id = auth.uid()));

-- registra os próprios treinos
create policy "aluno registra treino" on public.treino_logs
  for all using (exists (
    select 1 from public.alunos a where a.id = aluno_id and a.user_id = auth.uid()))
  with check (exists (
    select 1 from public.alunos a where a.id = aluno_id and a.user_id = auth.uid()));

create policy "aluno registra execucoes" on public.execucoes
  for all using (exists (
    select 1 from public.treino_logs tl join public.alunos a on a.id = tl.aluno_id
    where tl.id = treino_log_id and a.user_id = auth.uid()))
  with check (exists (
    select 1 from public.treino_logs tl join public.alunos a on a.id = tl.aluno_id
    where tl.id = treino_log_id and a.user_id = auth.uid()));

-- 5. Trigger: não cria profile de trainer para usuários com papel 'aluno'
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.raw_user_meta_data->>'papel', 'trainer') <> 'aluno' then
    insert into public.profiles (id, nome)
    values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)));
  end if;
  return new;
end; $$;
