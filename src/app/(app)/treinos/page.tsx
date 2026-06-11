import { createClient } from "@/lib/supabase/server";
import TreinosList from "./TreinosList";

export const dynamic = "force-dynamic";

export default async function TreinosPage() {
  const supabase = createClient();
  const { data: treinos } = await supabase
    .from("treinos")
    .select("id, nome, categoria, nivel, duracao_min, exercicios(nome, ordem), aluno_treinos(aluno_id)")
    .order("criado_em", { ascending: false });

  return <TreinosList treinos={(treinos as any) ?? []} />;
}
