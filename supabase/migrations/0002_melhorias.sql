-- FitCoach Pro — melhorias fase 3
-- Rode no SQL Editor do Supabase.

-- 1. Vídeo demonstrativo por exercício
alter table public.exercicios add column if not exists video_url text;

-- 2. Anamnese (1 por aluno)
create table if not exists public.anamneses (
  aluno_id uuid primary key references public.alunos on delete cascade,
  lesoes text,
  historico_saude text,
  medicamentos text,
  nivel_atividade text default 'sedentario'
    check (nivel_atividade in ('sedentario','leve','moderado','ativo','muito_ativo')),
  objetivo_detalhado text,
  observacoes text,
  atualizado_em timestamptz not null default now()
);

alter table public.anamneses enable row level security;

create policy "own anamneses" on public.anamneses
  for all using (exists (select 1 from public.alunos a where a.id = aluno_id and a.trainer_id = auth.uid()))
  with check (exists (select 1 from public.alunos a where a.id = aluno_id and a.trainer_id = auth.uid()));

-- 3. Cadastro público (aluno se inscreve pelo link do trainer, sem login)
create or replace function public.cadastro_publico(
  p_trainer uuid,
  p_nome text,
  p_email text,
  p_telefone text,
  p_objetivo text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_nome is null or length(trim(p_nome)) < 2 then
    raise exception 'Nome inválido';
  end if;
  if not exists (select 1 from profiles where id = p_trainer) then
    raise exception 'Link inválido';
  end if;
  -- limite anti-abuso: máx 20 cadastros públicos por trainer por dia
  if (select count(*) from alunos
      where trainer_id = p_trainer and status = 'novo' and criado_em > now() - interval '1 day') >= 20 then
    raise exception 'Limite de cadastros atingido, tente mais tarde';
  end if;
  insert into alunos (trainer_id, nome, email, telefone, objetivo, status, plano, valor_mensalidade, cor_avatar)
  values (p_trainer, trim(p_nome), nullif(trim(p_email), ''), nullif(trim(p_telefone), ''),
          nullif(trim(p_objetivo), ''), 'novo', 'basico', 0, '#4DA3FF');
end $$;

grant execute on function public.cadastro_publico to anon, authenticated;

-- nome público do trainer para a página de cadastro
create or replace function public.nome_trainer(p_trainer uuid)
returns text language sql security definer set search_path = public stable as $$
  select nome from profiles where id = p_trainer;
$$;

grant execute on function public.nome_trainer to anon, authenticated;

-- 4. Storage: bucket de avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar read" on storage.objects
  for select to public using (bucket_id = 'avatars');

create policy "avatar insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatar update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatar delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
