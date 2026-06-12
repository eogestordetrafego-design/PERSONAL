"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconBolt, IconBrandGoogle } from "@tabler/icons-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    const supabase = createClient();
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) setErro("E-mail ou senha inválidos.");
      else {
        router.push("/dashboard");
        router.refresh();
        return;
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      });
      if (error) setErro(error.message);
      else {
        router.push("/dashboard");
        router.refresh();
        return;
      }
    }
    setLoading(false);
  }

  async function google() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  async function resetSenha() {
    if (!email) return setErro("Informe seu e-mail para redefinir a senha.");
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email);
    setErro("Enviamos um link de redefinição para seu e-mail.");
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mb-4">
            <IconBolt size={34} className="text-accent" />
          </div>
          <h1 className="text-2xl font-black">FitCoach Pro</h1>
          <p className="text-txt2 text-sm mt-1">Seu negócio fitness em um só lugar</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              className="input"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          )}
          <input
            className="input"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
          />
          {erro && <p className="text-danger text-xs">{erro}</p>}
          <button
            disabled={loading}
            className="w-full bg-accent text-bg font-bold rounded-2xl py-3.5 transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button onClick={resetSenha} className="block mx-auto mt-3 text-xs text-txt2 hover:text-txt">
          Esqueceu a senha?
        </button>

        <button
          onClick={google}
          className="w-full mt-4 border border-line rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-card transition-all duration-150"
        >
          <IconBrandGoogle size={18} /> Continuar com Google
        </button>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="block mx-auto mt-6 text-sm text-accent font-bold"
        >
          {mode === "login" ? "Criar conta grátis" : "Já tenho conta — entrar"}
        </button>
      </div>
    </div>
  );
}
