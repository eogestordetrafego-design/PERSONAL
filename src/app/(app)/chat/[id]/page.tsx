"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui";
import { toast } from "@/components/Toast";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";

type Msg = { id: string; autor: string; texto: string; criado_em: string };

export default function ChatDetalhePage() {
  const params = useParams<{ id: string }>();
  const alunoId = params.id;
  const [aluno, setAluno] = useState<{ nome: string; cor_avatar: string } | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function carregar() {
      const [{ data: a }, { data: m }] = await Promise.all([
        supabase.from("alunos").select("nome, cor_avatar").eq("id", alunoId).single(),
        supabase
          .from("mensagens")
          .select("id, autor, texto, criado_em")
          .eq("aluno_id", alunoId)
          .order("criado_em"),
      ]);
      setAluno(a);
      setMsgs(m ?? []);
      // marca como lidas
      supabase
        .from("mensagens")
        .update({ lida: true })
        .eq("aluno_id", alunoId)
        .eq("autor", "aluno")
        .eq("lida", false)
        .then(() => {});
    }
    carregar();

    const canal = supabase
      .channel(`chat-${alunoId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensagens", filter: `aluno_id=eq.${alunoId}` },
        (payload) => {
          const nova = payload.new as Msg & { aluno_id: string };
          setMsgs((cur) => (cur.some((x) => x.id === nova.id) ? cur : [...cur, nova]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [alunoId]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function enviar() {
    const t = texto.trim();
    if (!t || enviando) return;
    setEnviando(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("mensagens")
      .insert({ trainer_id: user!.id, aluno_id: alunoId, autor: "trainer", texto: t, lida: true })
      .select("id, autor, texto, criado_em")
      .single();
    setEnviando(false);
    if (error) return toast("Erro ao enviar mensagem", "erro");
    setTexto("");
    if (data) setMsgs((cur) => (cur.some((x) => x.id === data.id) ? cur : [...cur, data]));
  }

  return (
    <div className="fixed inset-0 max-w-[480px] mx-auto flex flex-col bg-bg z-50">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-line bg-bg">
        <Link href="/chat" className="w-10 h-10 rounded-2xl bg-card border border-line flex items-center justify-center shrink-0">
          <IconArrowLeft size={20} />
        </Link>
        {aluno && (
          <>
            <Avatar nome={aluno.nome} cor={aluno.cor_avatar} size="sm" online />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{aluno.nome}</p>
              <p className="text-[11px] text-accent">online</p>
            </div>
          </>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {msgs.map((m) => {
          const minha = m.autor === "trainer";
          return (
            <div key={m.id} className={`flex ${minha ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-snug ${
                  minha
                    ? "bg-accent text-bg rounded-2xl rounded-br-md font-medium"
                    : "bg-card border border-line rounded-2xl rounded-bl-md"
                }`}
              >
                <p>{m.texto}</p>
                <p className={`text-[9px] mt-1 text-right ${minha ? "text-bg/60" : "text-txt2"}`}>
                  {new Date(m.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        {msgs.length === 0 && (
          <p className="text-txt2 text-sm text-center pt-10">Envie a primeira mensagem 👋</p>
        )}
        <div ref={fimRef} />
      </div>

      <div className="px-4 py-3 border-t border-line bg-bg pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Escreva uma mensagem..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && enviar()}
          />
          <button
            onClick={enviar}
            disabled={enviando || !texto.trim()}
            className="shrink-0 w-12 h-12 rounded-2xl bg-accent text-bg flex items-center justify-center active:scale-90 transition-all duration-150 disabled:opacity-40"
          >
            <IconSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
