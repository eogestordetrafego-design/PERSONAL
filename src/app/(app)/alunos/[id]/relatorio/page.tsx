import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { hora } from "@/lib/format";
import PrintButton from "./PrintButton";
import { IconArrowLeft } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function RelatorioPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: aluno }, { data: profile }, { data: medidas }, { data: sessoes }] =
    await Promise.all([
      supabase.from("alunos").select("*").eq("id", params.id).single(),
      supabase.from("profiles").select("nome, cref").eq("id", user!.id).single(),
      supabase.from("medidas").select("data, peso_kg, gordura_pct, imc").eq("aluno_id", params.id).order("data"),
      supabase
        .from("sessoes")
        .select("inicio, status, treinos(nome)")
        .eq("aluno_id", params.id)
        .order("inicio", { ascending: false })
        .limit(20),
    ]);

  if (!aluno) notFound();

  const meds = medidas ?? [];
  const realizadas = (sessoes ?? []).filter((s) => s.status === "realizada").length;
  const canceladas = (sessoes ?? []).filter((s) => s.status === "cancelada").length;
  const evolucao =
    meds.length > 1 ? Number(meds[meds.length - 1].peso_kg) - Number(meds[0].peso_kg) : null;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/alunos/${params.id}`} className="w-10 h-10 rounded-2xl bg-card border border-line flex items-center justify-center">
            <IconArrowLeft size={20} />
          </Link>
          <h1 className="font-black">Relatório</h1>
        </div>
        <PrintButton />
      </header>

      <div className="print:text-black">
        <div className="text-center border-b border-line pb-4 mb-4">
          <h2 className="text-lg font-black">Relatório de Evolução</h2>
          <p className="text-sm text-txt2 mt-1">{aluno.nome}</p>
          <p className="text-[11px] text-txt2">
            {profile?.nome}{profile?.cref ? ` · CREF ${profile.cref}` : ""} ·{" "}
            {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <Card className="text-center !p-3">
            <p className="font-black text-sm">
              {meds.length ? `${Number(meds[meds.length - 1].peso_kg).toFixed(1).replace(".", ",")}kg` : "—"}
            </p>
            <p className="text-[10px] text-txt2">Peso atual</p>
          </Card>
          <Card className="text-center !p-3">
            <p className="font-black text-sm">
              {evolucao !== null ? `${evolucao > 0 ? "+" : ""}${evolucao.toFixed(1).replace(".", ",")}kg` : "—"}
            </p>
            <p className="text-[10px] text-txt2">Evolução</p>
          </Card>
          <Card className="text-center !p-3">
            <p className="font-black text-sm">{realizadas}</p>
            <p className="text-[10px] text-txt2">Sessões feitas</p>
          </Card>
        </div>

        <h3 className="font-black text-sm mb-2">Histórico de medidas</h3>
        <Card className="mb-5 !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-txt2 uppercase border-b border-line">
                <th className="text-left p-3">Data</th>
                <th className="text-right p-3">Peso</th>
                <th className="text-right p-3">% Gordura</th>
                <th className="text-right p-3">IMC</th>
              </tr>
            </thead>
            <tbody>
              {meds.map((m, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="p-3">{new Date(m.data + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                  <td className="p-3 text-right font-bold">{Number(m.peso_kg).toFixed(1).replace(".", ",")}kg</td>
                  <td className="p-3 text-right">{m.gordura_pct ? `${m.gordura_pct}%` : "—"}</td>
                  <td className="p-3 text-right">{m.imc ? String(m.imc).replace(".", ",") : "—"}</td>
                </tr>
              ))}
              {meds.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-txt2">Sem medidas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </Card>

        <h3 className="font-black text-sm mb-2">
          Últimas sessões ({realizadas} realizadas{canceladas > 0 ? `, ${canceladas} canceladas` : ""})
        </h3>
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {(sessoes ?? []).map((s, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="p-3">
                    {new Date(s.inicio).toLocaleDateString("pt-BR")} · {hora(s.inicio)}
                  </td>
                  <td className="p-3">{(s.treinos as any)?.nome ?? "Treino"}</td>
                  <td className={`p-3 text-right font-bold ${s.status === "realizada" ? "text-accent" : s.status === "cancelada" ? "text-danger" : "text-txt2"}`}>
                    {s.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
