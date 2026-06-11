"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, Badge, Card, statusBadge } from "@/components/ui";
import { toast } from "@/components/Toast";
import { hora } from "@/lib/format";
import { IconChevronLeft, IconChevronRight, IconPlus, IconX, IconCheck, IconBan } from "@tabler/icons-react";

type Sessao = {
  id: string;
  inicio: string;
  status: string;
  alunos: { nome: string; cor_avatar: string } | null;
  treinos: { nome: string } | null;
};

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function semanaDe(d: Date) {
  const seg = new Date(d);
  seg.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // segunda
  return Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(seg);
    dia.setDate(seg.getDate() + i);
    return dia;
  });
}

const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export default function AgendaPage() {
  const [ref, setRef] = useState(new Date());
  const [diaAtivo, setDiaAtivo] = useState(new Date());
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [dotsDias, setDotsDias] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [alunos, setAlunos] = useState<{ id: string; nome: string }[]>([]);
  const [treinos, setTreinos] = useState<{ id: string; nome: string }[]>([]);
  const [form, setForm] = useState({ aluno: "", treino: "", horaStr: "08:00" });

  const semana = useMemo(() => semanaDe(ref), [ref]);

  const carregarSemana = useCallback(async () => {
    const ini = new Date(semana[0]); ini.setHours(0, 0, 0, 0);
    const fim = new Date(semana[6]); fim.setHours(23, 59, 59, 999);
    const supabase = createClient();
    const { data } = await supabase
      .from("sessoes")
      .select("id, inicio, status, alunos(nome, cor_avatar), treinos(nome)")
      .gte("inicio", ini.toISOString())
      .lte("inicio", fim.toISOString())
      .order("inicio");
    const all = (data as any as Sessao[]) ?? [];
    setDotsDias(new Set(all.map((s) => new Date(s.inicio).toDateString())));
    setSessoes(all);
    setLoading(false);
  }, [semana]);

  useEffect(() => {
    setLoading(true);
    carregarSemana();
  }, [carregarSemana]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("alunos").select("id, nome").eq("status", "ativo").order("nome")
      .then(({ data }) => setAlunos(data ?? []));
    supabase.from("treinos").select("id, nome").order("nome")
      .then(({ data }) => setTreinos(data ?? []));
  }, []);

  const doDia = sessoes.filter((s) => mesmoDia(new Date(s.inicio), diaAtivo));

  function mudarSemana(delta: number) {
    const n = new Date(ref);
    n.setDate(ref.getDate() + delta * 7);
    setRef(n);
    setDiaAtivo(n);
  }

  async function criarSessao(e: React.FormEvent) {
    e.preventDefault();
    if (!form.aluno) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const [h, m] = form.horaStr.split(":").map(Number);
    const inicio = new Date(diaAtivo);
    inicio.setHours(h, m, 0, 0);
    const { error } = await supabase.from("sessoes").insert({
      trainer_id: user!.id,
      aluno_id: form.aluno,
      treino_id: form.treino || null,
      inicio: inicio.toISOString(),
    });
    if (error) return toast("Erro ao agendar", "erro");
    toast("Sessão agendada ✓");
    setModal(false);
    carregarSemana();
  }

  async function mudarStatus(id: string, status: string) {
    if (status === "cancelada" && !confirm("Cancelar esta sessão?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("sessoes").update({ status }).eq("id", id);
    if (error) return toast("Erro ao atualizar sessão", "erro");
    toast(status === "realizada" ? "Sessão concluída ✓" : "Sessão cancelada");
    carregarSemana();
  }

  const corDot: Record<string, string> = {
    realizada: "#00D68F",
    confirmada: "#00D68F",
    agendada: "#FFB020",
    cancelada: "#FF4D6D",
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-black">Agenda</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => mudarSemana(-1)} className="w-9 h-9 rounded-xl bg-card border border-line flex items-center justify-center">
            <IconChevronLeft size={18} />
          </button>
          <span className="text-sm font-bold capitalize w-32 text-center">
            {ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => mudarSemana(1)} className="w-9 h-9 rounded-xl bg-card border border-line flex items-center justify-center">
            <IconChevronRight size={18} />
          </button>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {semana.map((d) => {
          const ativo = mesmoDia(d, diaAtivo);
          const temSessao = dotsDias.has(d.toDateString());
          return (
            <button
              key={d.toISOString()}
              onClick={() => setDiaAtivo(d)}
              className={`flex flex-col items-center min-w-12 py-2.5 rounded-2xl transition-all duration-150 ${
                ativo ? "bg-accent text-bg" : "bg-card border border-line text-txt2"
              }`}
            >
              <span className="text-[10px] font-bold">{DIAS[d.getDay()]}</span>
              <span className="text-base font-black">{d.getDate()}</span>
              <span className={`w-1 h-1 rounded-full mt-0.5 ${temSessao ? (ativo ? "bg-bg" : "bg-accent") : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>

      <p className="text-sm font-bold capitalize">
        {diaAtivo.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric" })} —{" "}
        {doDia.length} {doDia.length === 1 ? "sessão" : "sessões"}
      </p>

      <div className="relative pl-6 space-y-3">
        <span className="absolute left-2 top-2 bottom-2 w-px bg-line" />
        {loading && <Card><p className="text-txt2 text-sm text-center py-4">Carregando...</p></Card>}
        {!loading && doDia.length === 0 && (
          <Card><p className="text-txt2 text-sm text-center py-4">Dia livre — sem sessões.</p></Card>
        )}
        {doDia.map((s) => {
          const sb = statusBadge[s.status];
          return (
            <div key={s.id} className="relative">
              <span
                className="absolute -left-[21px] top-5 w-2.5 h-2.5 rounded-full border-2 border-bg"
                style={{ background: corDot[s.status] }}
              />
              <Card className="flex items-center gap-3">
                <div className="text-xs font-black text-accent bg-accent/10 rounded-xl px-2 py-1.5">
                  {hora(s.inicio)}
                </div>
                <Avatar nome={s.alunos?.nome ?? "?"} cor={s.alunos?.cor_avatar ?? "#00D68F"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{s.alunos?.nome}</p>
                  <p className="text-[11px] text-txt2 truncate">{s.treinos?.nome ?? "Treino"}</p>
                </div>
                {s.status === "agendada" || s.status === "confirmada" ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => mudarStatus(s.id, "realizada")}
                      title="Marcar como realizada"
                      className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center active:scale-90 transition-all duration-150"
                    >
                      <IconCheck size={16} />
                    </button>
                    <button
                      onClick={() => mudarStatus(s.id, "cancelada")}
                      title="Cancelar"
                      className="w-8 h-8 rounded-xl bg-danger/15 text-danger flex items-center justify-center active:scale-90 transition-all duration-150"
                    >
                      <IconBan size={16} />
                    </button>
                  </div>
                ) : (
                  <Badge variant={sb.variant}>{sb.label}</Badge>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setModal(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-accent text-bg flex items-center justify-center shadow-lg shadow-accent/30 active:scale-90 transition-all duration-150 z-40"
      >
        <IconPlus size={26} />
      </button>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={() => setModal(false)}>
          <div
            className="bg-card border border-line rounded-t-3xl w-full max-w-[480px] p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black">
                Nova sessão — {diaAtivo.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </h2>
              <button onClick={() => setModal(false)}><IconX size={20} className="text-txt2" /></button>
            </div>
            <form onSubmit={criarSessao} className="space-y-3">
              <select className="input" required value={form.aluno} onChange={(e) => setForm({ ...form, aluno: e.target.value })}>
                <option value="">Selecione o aluno</option>
                {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
              <select className="input" value={form.treino} onChange={(e) => setForm({ ...form, treino: e.target.value })}>
                <option value="">Treino (opcional)</option>
                {treinos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
              <input className="input" type="time" value={form.horaStr} onChange={(e) => setForm({ ...form, horaStr: e.target.value })} />
              <button className="w-full bg-accent text-bg font-bold rounded-2xl py-3.5 active:scale-[0.98] transition-all duration-150">
                Agendar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
