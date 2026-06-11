import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";

function senhaTemporaria() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(request: Request) {
  const { alunoId } = await request.json();
  if (!alunoId) return NextResponse.json({ erro: "alunoId obrigatório" }, { status: 400 });

  // trainer autenticado e dono do aluno
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { data: aluno } = await supabase
    .from("alunos")
    .select("id, nome, email, user_id")
    .eq("id", alunoId)
    .single();
  if (!aluno) return NextResponse.json({ erro: "Aluno não encontrado" }, { status: 404 });
  if (!aluno.email) {
    return NextResponse.json({ erro: "Cadastre um e-mail no aluno antes de criar o acesso." }, { status: 400 });
  }
  if (aluno.user_id) {
    return NextResponse.json({ erro: "Este aluno já tem acesso criado." }, { status: 409 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ erro: "SUPABASE_SERVICE_ROLE_KEY ausente" }, { status: 500 });

  const admin = createServiceClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const senha = senhaTemporaria();
  const { data: novo, error } = await admin.auth.admin.createUser({
    email: aluno.email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome: aluno.nome, papel: "aluno" },
  });
  if (error || !novo.user) {
    return NextResponse.json(
      { erro: error?.message?.includes("already") ? "Já existe um usuário com esse e-mail." : "Erro ao criar usuário." },
      { status: 500 }
    );
  }

  const { error: e2 } = await admin.from("alunos").update({ user_id: novo.user.id }).eq("id", alunoId);
  if (e2) {
    await admin.auth.admin.deleteUser(novo.user.id);
    return NextResponse.json({ erro: "Erro ao vincular acesso." }, { status: 500 });
  }

  return NextResponse.json({ email: aluno.email, senha });
}
