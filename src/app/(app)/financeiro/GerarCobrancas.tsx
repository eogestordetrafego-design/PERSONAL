"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/Toast";
import { IconReceipt2 } from "@tabler/icons-react";

export default function GerarCobrancas() {
  const router = useRouter();
  const [gerando, setGerando] = useState(false);

  async function gerar() {
    setGerando(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const hoje = new Date();
    const mesIni = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
    const mesFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10);
    const vencimento = new Date(hoje.getFullYear(), hoje.getMonth(), 5).toISOString().slice(0, 10);

    const [{ data: alunos }, { data: existentes }] = await Promise.all([
      supabase.from("alunos").select("id, valor_mensalidade").eq("status", "ativo").gt("valor_mensalidade", 0),
      supabase.from("pagamentos").select("aluno_id").gte("vencimento", mesIni).lte("vencimento", mesFim),
    ]);

    const jaTem = new Set((existentes ?? []).map((p) => p.aluno_id));
    const novos = (alunos ?? [])
      .filter((a) => !jaTem.has(a.id))
      .map((a) => ({
        trainer_id: user!.id,
        aluno_id: a.id,
        valor: a.valor_mensalidade,
        vencimento,
        status: "pendente" as const,
      }));

    if (novos.length === 0) {
      setGerando(false);
      return toast("Todos os alunos ativos já têm cobrança neste mês");
    }
    const { error } = await supabase.from("pagamentos").insert(novos);
    setGerando(false);
    if (error) return toast("Erro ao gerar cobranças", "erro");
    toast(`${novos.length} ${novos.length === 1 ? "cobrança gerada" : "cobranças geradas"} ✓`);
    router.refresh();
  }

  return (
    <button
      onClick={gerar}
      disabled={gerando}
      title="Gerar cobranças do mês"
      className="flex items-center gap-1.5 text-xs font-bold bg-accent/15 text-accent rounded-2xl px-3.5 py-2.5 active:scale-95 transition-all duration-150 disabled:opacity-50"
    >
      <IconReceipt2 size={16} /> {gerando ? "..." : "Gerar cobranças"}
    </button>
  );
}
