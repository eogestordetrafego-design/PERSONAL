"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge, Card } from "@/components/ui";
import { Toggle } from "@/components/ui/client";
import { toast } from "@/components/Toast";
import {
  IconUser,
  IconCreditCard,
  IconBell,
  IconMessage,
  IconQrcode,
  IconBrandWhatsapp,
  IconChartBar,
  IconDeviceMobile,
  IconHelp,
  IconLogout,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";

function Row({
  Icon,
  label,
  right,
  onClick,
  danger,
}: {
  Icon: any;
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3.5 border-b border-line last:border-0 text-left"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? "bg-danger/15 text-danger" : "bg-line/60 text-txt2"}`}>
        <Icon size={18} />
      </div>
      <span className={`flex-1 text-sm font-bold ${danger ? "text-danger" : ""}`}>{label}</span>
      {right ?? <IconChevronRight size={16} className="text-txt2" />}
    </button>
  );
}

type Perfil = { nome: string; cref: string; especialidades: string[] };

export default function MaisClient({ planoApp, perfil }: { planoApp: string; perfil: Perfil }) {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [form, setForm] = useState({
    nome: perfil.nome,
    cref: perfil.cref,
    especialidades: perfil.especialidades.join(", "),
  });

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        nome: form.nome,
        cref: form.cref || null,
        especialidades: form.especialidades
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })
      .eq("id", user!.id);
    setSalvando(false);
    if (error) return toast("Erro ao salvar perfil", "erro");
    toast("Perfil atualizado ✓");
    setModal(false);
    router.refresh();
  }

  const emBreve = () => toast("Disponível em breve 🚀");

  async function copiarLink() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const url = `${location.origin}/cadastro/${user!.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copiado! Compartilhe com novos alunos ✓");
    } catch {
      prompt("Copie seu link de cadastro:", url);
    }
  }

  async function enviarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviandoFoto(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user!.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      setEnviandoFoto(false);
      return toast("Erro ao enviar foto", "erro");
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase
      .from("profiles")
      .update({ avatar_url: `${pub.publicUrl}?v=${Date.now()}` })
      .eq("id", user!.id);
    setEnviandoFoto(false);
    toast("Foto atualizada ✓");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <section>
        <h2 className="font-black text-sm mb-2 text-txt2 uppercase text-[11px]">Conta</h2>
        <Card className="!py-1">
          <Row Icon={IconUser} label="Editar perfil" onClick={() => setModal(true)} />
          <Row Icon={IconCreditCard} label="Plano & assinatura" onClick={emBreve}
            right={<Badge variant="verde">{planoApp === "pro" ? "Pro" : planoApp}</Badge>} />
          <Row Icon={IconBell} label="Notificações" right={<Toggle initial />} />
        </Card>
      </section>

      <section>
        <h2 className="font-black text-sm mb-2 text-txt2 uppercase text-[11px]">Negócio</h2>
        <Card className="!py-1">
          <Row Icon={IconMessage} label="Mensagens" onClick={() => router.push("/chat")} />
          <Row Icon={IconChartBar} label="Financeiro & relatórios" onClick={() => router.push("/financeiro")} />
          <Row Icon={IconQrcode} label="Meu link de cadastro" onClick={copiarLink}
            right={<Badge variant="verde">Copiar</Badge>} />
          <Row Icon={IconBrandWhatsapp} label="Integração WhatsApp" onClick={emBreve}
            right={<Badge variant="cinza">Em breve</Badge>} />
          <Row Icon={IconDeviceMobile} label="App do aluno" onClick={emBreve} />
        </Card>
      </section>

      <section>
        <h2 className="font-black text-sm mb-2 text-txt2 uppercase text-[11px]">Suporte</h2>
        <Card className="!py-1">
          <Row Icon={IconHelp} label="Ajuda & tutoriais" onClick={emBreve} />
          <Row Icon={IconLogout} label="Sair da conta" danger onClick={sair} right={<span />} />
        </Card>
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={() => setModal(false)}>
          <div
            className="bg-card border border-line rounded-t-3xl w-full max-w-[480px] p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black">Editar perfil</h2>
              <button onClick={() => setModal(false)}><IconX size={20} className="text-txt2" /></button>
            </div>
            <label className="block">
              <span className="text-[11px] text-txt2 font-bold uppercase">Foto de perfil</span>
              <input type="file" accept="image/*" onChange={enviarFoto} disabled={enviandoFoto}
                className="block w-full text-xs text-txt2 mt-1 file:mr-3 file:rounded-xl file:border-0 file:bg-accent/15 file:text-accent file:font-bold file:px-3 file:py-2" />
            </label>
            <form onSubmit={salvarPerfil} className="space-y-3">
              <input className="input" required value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
              <input className="input" value={form.cref}
                onChange={(e) => setForm({ ...form, cref: e.target.value })} placeholder="CREF (ex: 123456-G/SP)" />
              <input className="input" value={form.especialidades}
                onChange={(e) => setForm({ ...form, especialidades: e.target.value })}
                placeholder="Especialidades separadas por vírgula" />
              <button disabled={salvando}
                className="w-full bg-accent text-bg font-bold rounded-2xl py-3.5 active:scale-[0.98] transition-all duration-150 disabled:opacity-50">
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
