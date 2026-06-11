"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBarbell,
  IconChartLine,
  IconMessage,
  IconReceipt2,
} from "@tabler/icons-react";

const tabs = [
  { href: "/aluno", label: "Treino", Icon: IconBarbell, exato: true },
  { href: "/aluno/evolucao", label: "Evolução", Icon: IconChartLine, exato: false },
  { href: "/aluno/chat", label: "Chat", Icon: IconMessage, exato: false },
  { href: "/aluno/pagamentos", label: "Pagamentos", Icon: IconReceipt2, exato: false },
];

export default function AlunoNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-bg/95 backdrop-blur border-t border-line print:hidden">
      <div className="max-w-[480px] mx-auto flex justify-around py-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {tabs.map(({ href, label, Icon, exato }) => {
          const active = exato ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-150 ${
                active ? "bg-accent/10 text-accent" : "text-txt2"
              }`}
            >
              <Icon size={22} stroke={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-bold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
