import { createClient } from "@/lib/supabase/server";
import { Badge, StatBox } from "@/components/ui";
import { brl, iniciais } from "@/lib/format";
import MaisClient from "./MaisClient";

export const dynamic = "force-dynamic";

export default async function MaisPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: ativos }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("alunos").select("valor_mensalidade").eq("status", "ativo"),
  ]);

  const receita = (ativos ?? []).reduce((s, a) => s + Number(a.valor_mensalidade), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center pt-2">
        <div className="w-24 h-24 rounded-full bg-accent/15 text-accent flex items-center justify-center text-3xl font-black">
          {iniciais(profile?.nome ?? "?")}
        </div>
        <h1 className="text-xl font-black mt-3">{profile?.nome}</h1>
        {profile?.cref && <p className="text-txt2 text-xs mt-1">CREF {profile.cref}</p>}
        <div className="flex gap-2 mt-3 flex-wrap justify-center">
          {(profile?.especialidades ?? []).map((e: string) => (
            <Badge key={e} variant="verde">{e}</Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto -mx-4 px-4">
        <StatBox valor={String((ativos ?? []).length)} label="Alunos ativos" />
        <StatBox valor={brl(receita)} label="Receita/mês" />
        <StatBox valor="⭐ 4.9" label="Avaliação" />
      </div>

      <MaisClient planoApp={profile?.plano_app ?? "pro"} />
    </div>
  );
}
