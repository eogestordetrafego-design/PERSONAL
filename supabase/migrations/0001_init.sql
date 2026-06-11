-- FitCoach Pro — schema inicial
create extension if not exists pgcrypto;

-- PROFILES (personal trainer)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  nome text not null default '',
  cref text,
  avatar_url text,
  especialidades text[] not null default '{}',
  plano_app text not null default 'pro',
  criado_em timestamptz not null default now()
);

-- ALUNOS
create table public.alunos (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles on delete cascade,
  nome text not null,
  email text,
  telefone text,
  data_nascimento date,
  altura_cm int,
  objetivo text,
  plano text not null default 'basico' check (plano in ('basico','pro','premium','vip')),
  valor_mensalidade numeric not null default 0,
  dias_semana text[] not null default '{}',
  status text not null default 'novo' check (status in ('ativo','inativo','novo')),
  cor_avatar text not null default '#00D68F',
  meta_peso_kg numeric,
  criado_em timestamptz not null default now()
);

-- MEDIDAS (histórico corporal)
create table public.medidas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos on delete cascade,
  data date not null default current_date,
  peso_kg numeric not null,
  gordura_pct numeric,
  imc numeric
);

-- TREINOS (protocolos)
create table public.treinos (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles on delete cascade,
  nome text not null,
  categoria text not null default 'funcional'
    check (categoria in ('emagrecimento','hipertrofia','funcional','reabilitacao')),
  nivel text not null default 'Iniciante',
  duracao_min int not null default 60,
  observacoes text,
  criado_em timestamptz not null default now()
);

-- EXERCÍCIOS
create table public.exercicios (
  id uuid primary key default gen_random_uuid(),
  treino_id uuid not null references public.treinos on delete cascade,
  ordem int not null default 0,
  nome text not null,
  series int not null default 3,
  reps int not null default 12,
  carga_kg numeric not null default 0,
  icone text default 'barbell'
);

-- VÍNCULO ALUNO x TREINO
create table public.aluno_treinos (
  aluno_id uuid not null references public.alunos on delete cascade,
  treino_id uuid not null references public.treinos on delete cascade,
  atribuido_em timestamptz not null default now(),
  primary key (aluno_id, treino_id)
);

-- SESSÕES (agenda)
create table public.sessoes (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles on delete cascade,
  aluno_id uuid not null references public.alunos on delete cascade,
  treino_id uuid references public.treinos on delete set null,
  inicio timestamptz not null,
  duracao_min int not null default 60,
  status text not null default 'agendada'
    check (status in ('agendada','confirmada','realizada','cancelada')),
  observacao text
);

-- PAGAMENTOS (fase 2)
create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles on delete cascade,
  aluno_id uuid not null references public.alunos on delete cascade,
  valor numeric not null,
  vencimento date not null,
  pago_em date,
  metodo text,
  status text not null default 'pendente' check (status in ('pago','pendente','atrasado'))
);

-- MENSAGENS (fase 2, Realtime)
create table public.mensagens (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles on delete cascade,
  aluno_id uuid not null references public.alunos on delete cascade,
  autor text not null check (autor in ('trainer','aluno')),
  texto text not null,
  lida boolean not null default false,
  criado_em timestamptz not null default now()
);

-- TRIGGER: cria profile ao registrar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.alunos enable row level security;
alter table public.medidas enable row level security;
alter table public.treinos enable row level security;
alter table public.exercicios enable row level security;
alter table public.aluno_treinos enable row level security;
alter table public.sessoes enable row level security;
alter table public.pagamentos enable row level security;
alter table public.mensagens enable row level security;

create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own alunos" on public.alunos
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

create policy "own medidas" on public.medidas
  for all using (exists (select 1 from public.alunos a where a.id = aluno_id and a.trainer_id = auth.uid()))
  with check (exists (select 1 from public.alunos a where a.id = aluno_id and a.trainer_id = auth.uid()));

create policy "own treinos" on public.treinos
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

create policy "own exercicios" on public.exercicios
  for all using (exists (select 1 from public.treinos t where t.id = treino_id and t.trainer_id = auth.uid()))
  with check (exists (select 1 from public.treinos t where t.id = treino_id and t.trainer_id = auth.uid()));

create policy "own aluno_treinos" on public.aluno_treinos
  for all using (exists (select 1 from public.alunos a where a.id = aluno_id and a.trainer_id = auth.uid()))
  with check (exists (select 1 from public.alunos a where a.id = aluno_id and a.trainer_id = auth.uid()));

create policy "own sessoes" on public.sessoes
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

create policy "own pagamentos" on public.pagamentos
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

create policy "own mensagens" on public.mensagens
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

-- Realtime no chat
alter publication supabase_realtime add table public.mensagens;
