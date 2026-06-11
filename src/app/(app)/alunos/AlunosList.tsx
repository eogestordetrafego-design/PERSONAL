"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, Badge, Card, planoLabel, statusBadge } from "@/components/ui";
import { TabPills } from "@/components/ui/client";
import { IconPlus, IconSearch, IconX } from "@tabler/icons-react";

type Aluno = {
  id: string;
  nome: string;
  objetivo: string | null;
  plano: string;
  dias_semana: string[];
  status: string;
  cor_avatar: string;
};

const CORES = ["#FF4D6D", "#7B6EF6", "#FFB020", "#00D68F", "#FF6EC7", "#4DA3FF"];

export default function AlunosList({ alunos }: { alunos: Aluno[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [tab, setTab] = useState("todos");
  const [novo, setNovo] = useState(false);
  const [form, setForm] = useState({ nome: "", objetivo: "", plano: "basico", valor: 299 });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const lista = useMemo(
    () =>
      alunos.filter((a) => {
        if (busca && !a.nome.toLowerCase().includes(busca.toLowerCase())) return false;
        if (tab === "todos") return true;
        if (tab === "ativos") return a.status === "ativo";
        if (tab === "inativos") return a.status === "inativo";
        return a.status === "novo";
      }),
    [alunos, busca, tab]
  );

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("alunos").insert({
      trainer_id: user!.id,
      nome: form.nome,
      objetivo: form.objetivo || null,
      plano: form.plano,
      valor_mensalidade: form.valor,
      status: "novo",
      cor_avatar: CORES[Math.floor(Math.random() * CORES.length)],
    });
    setSalvando(false);
    if (error) return setErro(error.message);
    setNovo(false);
    setForm({ nome: "", objetivo: "", plano: "basico", valor: 299 });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-black">Alunos</h1>
        <button
          onClick={() => setNovo(true)}
          className="w-10 h-10 rounded-2xl bg-accent text-bg flex items-center justify-center active:scale-95 transition-all duration-150"
        >
          <IconPlus size={20} />
        </button>
      </header>

      <div className="relative">
        <IconSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt2" />
        <input
          className="input pl-10"
          placeholder="Buscar aluno..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <TabPills
        tabs={[
          { key: "todos", label: "Todos" },
          { key: "ativos", label: "Ativos" },
          { key: "inativos", label: "Inativos" },
          { key: "novos", label: "Novos" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="space-y-2.5">
        {lista.length === 0 && (
          <Card><p className="text-txt2 text-sm text-center py-4">Nenhum aluno encontrado.</p></Card>
        )}
        {lista.map((a) => {
          const st = statusBadge[a.status];
          return (
            <Link key={a.id} href={`/alunos/${a.id}`} className="block">
              <Card className="flex items-center gap-3 hover:border-accent/40 transition-all duration-150">
                <Avatar nome={a.nome} cor={a.cor_avatar} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{a.nome}</p>
                  <p className="text-[11px] text-txt2 truncate">
                    {a.objetivo ?? "Sem objetivo"} · {planoLabel[a.plano]}
                    {a.dias_semana.length > 0 && ` · ${a.dias_semana.join(", ")}`}
                  </p>
                </div>
                <Badge variant={st.variant}>{st.label}</Badge>
              </Card>
            </Link>
          );
        })}
      </div>

      {novo && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={() => setNovo(false)}>
          <div
            className="bg-card border border-line rounded-t-3xl w-full max-w-[480px] p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black">Novo aluno</h2>
              <button onClick={() => setNovo(false)}><IconX size={20} className="text-txt2" /></button>
            </div>
            <form onSubmit={criar} className="space-y-3">
              <input className="input" placeholder="Nome completo" required value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <input className="input" placeholder="Objetivo (ex: Perder 5kg)" value={form.objetivo}
                onChange={(e) => setForm({ ...form, objetivo: e.target.value })} />
              <div className="flex gap-3">
                <select className="input" value={form.plano}
                  onChange={(e) => {
                    const p = e.target.value;
                    const v = { basico: 299, pro: 499, premium: 799, vip: 1099 }[p] ?? 299;
                    setForm({ ...form, plano: p, valor: v });
                  }}>
                  <option value="basico">Básico — R$299</option>
                  <option value="pro">Pro — R$499</option>
                  <option value="premium">Premium — R$799</option>
                  <option value="vip">VIP — R$1.099</option>
                </select>
              </div>
              {erro && <p className="text-danger text-xs">{erro}</p>}
              <button disabled={salvando}
                className="w-full bg-accent text-bg font-bold rounded-2xl py-3.5 active:scale-[0.98] transition-all duration-150 disabled:opacity-50">
                {salvando ? "Salvando..." : "Adicionar aluno"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
