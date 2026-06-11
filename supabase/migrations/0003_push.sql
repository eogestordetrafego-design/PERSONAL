-- FitCoach Pro — assinaturas de push notification
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  criado_em timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "own push" on public.push_subscriptions
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());
