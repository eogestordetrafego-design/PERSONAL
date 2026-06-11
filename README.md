# FitCoach Pro

Plataforma para personal trainers gerenciarem alunos, treinos, agenda e finanças.
Stack: **Next.js 14 (App Router) + TypeScript + Tailwind + Supabase + Vercel**.

## Setup

### 1. Supabase
1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute na ordem:
   - `supabase/migrations/0001_init.sql` (schema + RLS)
   - `supabase/seed.sql` (dados de demonstração)
3. (Opcional) Em **Authentication → Providers**, habilite Google OAuth

Login de demonstração: `rafael@fitcoach.com` / `fitcoach123`

### 2. Local (VSCode)
```bash
npm install
cp .env.local.example .env.local   # preencha com URL e anon key do projeto
npm run dev                        # http://localhost:3000
```

As chaves estão em **Project Settings → API** no painel do Supabase.

### 3. Deploy na Vercel
```bash
npm i -g vercel
vercel
```
Ou conecte o repositório Git no painel da Vercel. Configure as env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Para o Google OAuth funcionar em produção, adicione a URL da Vercel em
**Authentication → URL Configuration** no Supabase (Site URL e Redirect URLs:
`https://seu-app.vercel.app/auth/callback`).

## Estrutura
- `src/app/(auth)/login` — login, signup, reset de senha, Google
- `src/app/(app)/dashboard` — stats do dia, próxima sessão, progresso
- `src/app/(app)/alunos` — lista com busca/filtros + cadastro + perfil com gráfico de evolução
- `src/app/(app)/treinos` — protocolos por categoria + builder com contadores
- `src/app/(app)/agenda` — semana, timeline, criar/concluir/cancelar sessão
- `src/app/(app)/financeiro` — receita mensal, cobranças, marcar como pago
- `src/app/(app)/mais` — perfil do trainer, configurações, sair
- `supabase/` — migrations e seed

## Fase 2 (próximos passos)
- Chat trainer ↔ aluno com Supabase Realtime (tabela `mensagens` já criada e publicada)
- Edição de treino existente (`/treinos/[id]/editar`)
- Upload de avatar (Supabase Storage)
- Tipos gerados: `npx supabase gen types typescript --project-id SEU_ID > src/lib/database.types.ts`
