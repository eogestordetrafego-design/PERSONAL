"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge, Card } from "@/components/ui";
import { Toggle } from "@/components/ui/client";
import {
  IconUser,
  IconCreditCard,
  IconBell,
  IconMoon,
  IconQrcode,
  IconBrandWhatsapp,
  IconChartBar,
  IconDeviceMobile,
  IconHelp,
  IconLogout,
  IconChevronRight,
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

export default function MaisClient({ planoApp }: { planoApp: string }) {
  const router = useRouter();

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const emBreve = () => alert("Disponível em breve 🚀");

  return (
    <div className="space-y-5">
      <section>
        <h2 className="font-black text-sm mb-2 text-txt2 uppercase text-[11px]">Conta</h2>
        <Card className="!py-1">
          <Row Icon={IconUser} label="Editar perfil" onClick={emBreve} />
          <Row Icon={IconCreditCard} label="Plano & assinatura" onClick={emBreve}
            right={<Badge variant="verde">{planoApp === "pro" ? "Pro" : planoApp}</Badge>} />
          <Row Icon={IconBell} label="Notificações" right={<Toggle initial />} />
          <Row Icon={IconMoon} label="Modo escuro" right={<Toggle initial />} />
        </Card>
      </section>

      <section>
        <h2 className="font-black text-sm mb-2 text-txt2 uppercase text-[11px]">Negócio</h2>
        <Card className="!py-1">
          <Row Icon={IconQrcode} label="Meu link de cadastro" onClick={emBreve} />
          <Row Icon={IconBrandWhatsapp} label="Integração WhatsApp" onClick={emBreve}
            right={<Badge variant="verde">Ativo</Badge>} />
          <Row Icon={IconChartBar} label="Financeiro & relatórios" onClick={() => router.push("/financeiro")} />
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
    </div>
  );
}
