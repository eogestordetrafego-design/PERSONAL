"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar, Card } from "@/components/ui";
import { IconArrowLeft, IconSearch } from "@tabler/icons-react";

type Conversa = {
  alunoId: string;
  nome: string;
  cor: string;
  ultima: string | null;
  quando: string | null;
  naoLidas: number;
};

export default function ChatListaPage() {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let ativo = true;
    async function carregar() {
      if (!ativo) return;
      const [{ data: alunos }, { data: msgs }] = await Promise.all([
        supabase.from("alunos").select("id, nome, cor_avatar").neq("status", "inativo").order("nome"),
        supabase
          .from("mensagens")
          .select("aluno_id, texto, criado_em, lida, autor")
          .order("criado_em", { ascending: false }),
      ]);
      const porAluno = new Map<string, { texto: string; quando: string; naoLidas: number }>();
      (msgs ?? []).forEach((m) => {
        const cur = porAluno.get(m.aluno_id);
        if (!cur) {
          porAluno.set(m.aluno_id, {
            texto: m.texto,
            quando: m.criado_em,
            naoLidas: !m.lida && m.autor === "aluno" ? 1 : 0,
          });
        } else if (!m.lida && m.autor === "aluno") {
          cur.naoLidas++;
        }
      });
      const lista: Conversa[] = (alunos ?? []).map((a) => {
        const c = porAluno.get(a.id);
        return {
          alunoId: a.id,
          nome: a.nome,
          cor: a.cor_avatar,
          ultima: c?.texto ?? null,
          quando: c?.quando ?? null,
          naoLidas: c?.naoLidas ?? 0,
        };
      });
      lista.sort((x, y) => {
        if (x.naoLidas !== y.naoLidas) return y.naoLidas - x.naoLidas;
        if (x.quando && y.quando) return y.quando.localeCompare(x.quando);
        if (x.quando) return -1;
        if (y.quando) return 1;
        return x.nome.localeCompare(y.nome);
      });
      setConversas(lista);
      setLoading(false);
    }
    carregar();

    const canal = supabase
      .channel("chat-lista")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mensagens" }, () => carregar())
      .subscribe();

    return () => {
      ativo = false;
      supabase.removeChannel(canal);
    };
  }, []);

  const filtradas = useMemo(
    () => conversas.filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase())),
    [conversas, busca]
  );

  function horaLabel(iso: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    const hoje = new Date();
    if (d.toDateString() === hoje.toDateString())
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <Link href="/dashboard" className="w-10 h-10 rounded-2xl bg-card border border-line flex items-center justify-center">
          <IconArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black">Mensagens</h1>
      </header>

      <div className="relative">
        <IconSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt2" />
        <input
          className="input pl-10"
          placeholder="Buscar conversa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {loading && <Card><p className="text-txt2 text-sm text-center py-4">Carregando...</p></Card>}
        {!loading && filtradas.length === 0 && (
          <Card><p className="text-txt2 text-sm text-center py-4">Nenhuma conversa.</p></Card>
        )}
        {filtradas.map((c) => (
          <Link key={c.alunoId} href={`/chat/${c.alunoId}`} className="block">
            <Card className="flex items-center gap-3 hover:border-accent/40 transition-all duration-150">
              <Avatar nome={c.nome} cor={c.cor} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{c.nome}</p>
                <p className={`text-[11px] truncate ${c.naoLidas > 0 ? "text-txt font-bold" : "text-txt2"}`}>
                  {c.ultima ?? "Iniciar conversa"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-txt2">{horaLabel(c.quando)}</span>
                {c.naoLidas > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-accent text-bg text-[10px] font-black flex items-center justify-center">
                    {c.naoLidas}
                  </span>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
