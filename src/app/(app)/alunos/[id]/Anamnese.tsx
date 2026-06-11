"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";
import { toast } from "@/components/Toast";
import { IconClipboardHeart, IconPencil, IconX } from "@tabler/icons-react";

export type AnamneseData = {
  lesoes: string | null;
  historico_saude: string | null;
  medicamentos: string | null;
  nivel_atividade: string | null;
  objetivo_detalhado: string | null;
  observacoes: string | null;
} | null;

const NIVEIS: Record<string, string> = {
  sedentario: "Sedentário",
  leve: "Levemente ativo",
  moderado: "Moderadamente ativo",
  ativo: "Ativo",
  muito_ativo: "Muito ativo",
};

export default function Anamnese({ alunoId, dados }: { alunoId: string; dados: AnamneseData }) {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    lesoes: dados?.lesoes ?? "",
    historico_saude: dados?.historico_saude ?? "",
    medicamentos: dados?.medicamentos ?? "",
    nivel_atividade: dados?.nivel_atividade ?? "sedentario",
    objetivo_detalhado: dados?.objetivo_detalhado ?? "",
    observacoes: dados?.observacoes ?? "",
  });

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const supabase = createClient();
    const { error } = await supabase.from("anamneses").upsert({
      aluno_id: alunoId,
      lesoes: form.lesoes || null,
      historico_saude: form.historico_saude || null,
      medicamentos: form.medicamentos || null,
      nivel_atividade: form.nivel_atividade,
      objetivo_detalhado: form.objetivo_detalhado || null,
      observacoes: form.observacoes || null,
      atualizado_em: new Date().toISOString(),
    });
    setSalvando(false);
    if (error) return toast("Erro ao salvar anamnese", "erro");
    toast("Anamnese salva ✓");
    setModal(false);
    router.refresh();
  }

  const itens = [
    { label: "Lesões / limitações", valor: dados?.lesoes },
    { label: "Histórico de saúde", valor: dados?.historico_saude },
    { label: "Medicamentos", valor: dados?.medicamentos },
    { label: "Nível de atividade", valor: dados ? NIVEIS[dados.nivel_atividade ?? "sedentario"] : null },
    { label: "Objetivo detalhado", valor: dados?.objetivo_detalhado },
  ].filter((i) => i.valor);

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-black text-sm flex items-center gap-1.5">
          <IconClipboardHeart size={16} className="text-accent2" /> Anamnese
        </h3>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-1 text-[11px] font-bold text-accent"
        >
          <IconPencil size={13} /> {dados ? "Editar" : "Preencher"}
        </button>
      </div>
      <Card>
        {itens.length === 0 ? (
          <p className="text-txt2 text-sm text-center py-2">
            Anamnese não preenchida — importante antes do primeiro treino.
          </p>
        ) : (
          <div className="space-y-2.5">
            {itens.map((i) => (
              <div key={i.label}>
                <p className="text-[10px] text-txt2 uppercase font-bold">{i.label}</p>
                <p className="text-sm">{i.valor}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={() => setModal(false)}>
          <div
            className="bg-card border border-line rounded-t-3xl w-full max-w-[480px] p-5 space-y-3 max-h-[88dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black">Anamnese</h2>
              <button onClick={() => setModal(false)}><IconX size={20} className="text-txt2" /></button>
            </div>
            <form onSubmit={salvar} className="space-y-3">
              <select className="input" value={form.nivel_atividade}
                onChange={(e) => setForm({ ...form, nivel_atividade: e.target.value })}>
                {Object.entries(NIVEIS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <textarea className="input min-h-16 resize-none" placeholder="Lesões / limitações físicas"
                value={form.lesoes} onChange={(e) => setForm({ ...form, lesoes: e.target.value })} />
              <textarea className="input min-h-16 resize-none" placeholder="Histórico de saúde (cirurgias, condições...)"
                value={form.historico_saude} onChange={(e) => setForm({ ...form, historico_saude: e.target.value })} />
              <input className="input" placeholder="Medicamentos em uso"
                value={form.medicamentos} onChange={(e) => setForm({ ...form, medicamentos: e.target.value })} />
              <textarea className="input min-h-16 resize-none" placeholder="Objetivo detalhado"
                value={form.objetivo_detalhado} onChange={(e) => setForm({ ...form, objetivo_detalhado: e.target.value })} />
              <textarea className="input min-h-16 resize-none" placeholder="Observações gerais"
                value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
              <button disabled={salvando}
                className="w-full bg-accent text-bg font-bold rounded-2xl py-3.5 active:scale-[0.98] transition-all duration-150 disabled:opacity-50">
                {salvando ? "Salvando..." : "Salvar anamnese"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
