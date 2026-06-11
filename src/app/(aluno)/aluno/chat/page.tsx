"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui";
import { toast } from "@/components/Toast";
import { IconSend } from "@tabler/icons-react";

type Msg = { id: string; autor: string; texto: string; criado_em: string };

export default function ChatAlunoPage() {
  const [alunoId, setAlunoId] = useState<string | null>(null);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [trainerNome, setTrainerNome] = useState("Treinador");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let canal: ReturnType<typeof supabase.channel> | null = null;

    async function iniciar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: aluno } = await supabase
        .from("alunos")
        .select("id, trainer_id")
        .eq("user_id", user!.id)
        .single();
      if (!aluno) return;
      setAlunoId(aluno.id);
      setTrainerId(aluno.trainer_id);

      const [{ data: perfil }, { data: m }] = await Promise.all([
        supabase.from("profiles").select("nome").eq("id", aluno.trainer_id).single(),
        supabase
          .from("mensagens")
          .select("id, autor, texto, criado_em")
          .eq("aluno_id", aluno.id)
          .order("criado_em"),
      ]);
      if (perfil?.nome) setTrainerNome(perfil.nome);
      setMsgs(m ?? []);

      canal = supabase
        .channel(`chat-aluno-${aluno.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "mensagens", filter: `aluno_id=eq.${aluno.id}` },
          (payload) => {
            const nova = payload.new as Msg;
            setMsgs((cur) => (cur.some((x) => x.id === nova.id) ? cur : [...cur, nova]));
          }
        )
        .subscribe();
    }
    iniciar();

    return () => {
      if (canal) supabase.removeChannel(canal);
    };
  }, []);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function enviar() {
    const t = texto.trim();
    if (!t || enviando || !alunoId || !trainerId) return;
    setEnviando(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("mensagens")
      .insert({ trainer_id: trainerId, aluno_id: alunoId, autor: "aluno", texto: t })
      .select("id, autor, texto, criado_em")
      .single();
    setEnviando(false);
    if (error) return toast("Erro ao enviar", "erro");
    setTexto("");
    if (data) setMsgs((cur) => (cur.some((x) => x.id === data.id) ? cur : [...cur, data]));
  }

  return (
    <div className="fixed inset-0 max-w-[480px] mx-auto flex flex-col bg-bg z-30">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-line bg-bg">
        <Avatar nome={trainerNome} cor="#00D68F" size="sm" online />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{trainerNome}</p>
          <p className="text-[11px] text-accent">seu treinador</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {msgs.map((m) => {
          const minha = m.autor === "aluno";
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
          <p className="text-txt2 text-sm text-center pt-10">Mande uma mensagem para seu treinador 👋</p>
        )}
        <div ref={fimRef} />
      </div>

      <div className="px-4 py-3 border-t border-line bg-bg mb-16 pb-[max(0px,env(safe-area-inset-bottom))]">
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
