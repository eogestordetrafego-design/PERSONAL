"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconBolt, IconCircleCheck } from "@tabler/icons-react";

export default function CadastroPublicoPage() {
  const params = useParams<{ id: string }>();
  const [trainer, setTrainer] = useState<string | null>(null);
  const [invalido, setInvalido] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", objetivo: "" });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("nome_trainer", { p_trainer: params.id }).then(({ data, error }) => {
      if (error || !data) setInvalido(true);
      else setTrainer(data as string);
    });
  }, [params.id]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("cadastro_publico", {
      p_trainer: params.id,
      p_nome: form.nome,
      p_email: form.email,
      p_telefone: form.telefone,
      p_objetivo: form.objetivo,
    });
    setEnviando(false);
    if (error) return setErro("Não foi possível enviar. Tente novamente.");
    setEnviado(true);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mb-3">
            <IconBolt size={30} className="text-accent" />
          </div>
          <h1 className="text-xl font-black">FitCoach Pro</h1>
          {trainer && (
            <p className="text-txt2 text-sm mt-2">
              Cadastre-se como aluno de <span className="text-txt font-bold">{trainer}</span>
            </p>
          )}
        </div>

        {invalido ? (
          <p className="text-center text-danger text-sm">Link de cadastro inválido.</p>
        ) : enviado ? (
          <div className="text-center space-y-3">
            <IconCircleCheck size={56} className="text-accent mx-auto" />
            <h2 className="font-black text-lg">Cadastro enviado!</h2>
            <p className="text-txt2 text-sm">
              {trainer} recebeu seus dados e vai entrar em contato em breve. 💪
            </p>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-3">
            <input className="input" required minLength={2} placeholder="Seu nome completo"
              value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <input className="input" type="email" placeholder="E-mail"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" type="tel" placeholder="WhatsApp / telefone"
              value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <input className="input" placeholder="Seu objetivo (ex: perder peso)"
              value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })} />
            {erro && <p className="text-danger text-xs">{erro}</p>}
            <button disabled={enviando || !trainer}
              className="w-full bg-accent text-bg font-bold rounded-2xl py-3.5 active:scale-[0.98] transition-all duration-150 disabled:opacity-50">
              {enviando ? "Enviando..." : "Quero treinar!"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
