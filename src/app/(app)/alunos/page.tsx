import { createClient } from "@/lib/supabase/server";
import AlunosList from "./AlunosList";

export const dynamic = "force-dynamic";

export default async function AlunosPage() {
  const supabase = createClient();
  const { data: alunos } = await supabase
    .from("alunos")
    .select("id, nome, objetivo, plano, dias_semana, status, cor_avatar")
    .order("nome");

  return <AlunosList alunos={alunos ?? []} />;
}
