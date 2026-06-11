"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, categoriaInfo } from "@/components/ui";
import { TabPills } from "@/components/ui/client";
import { IconFlame, IconBarbell, IconRun, IconHeart, IconPlus, IconUsers } from "@tabler/icons-react";

const ICONS: Record<string, any> = {
  emagrecimento: IconFlame,
  hipertrofia: IconBarbell,
  funcional: IconRun,
  reabilitacao: IconHeart,
};

type Treino = {
  id: string;
  nome: string;
  categoria: string;
  nivel: string;
  duracao_min: number;
  exercicios: { nome: string; ordem: number }[];
  aluno_treinos: { aluno_id: string }[];
};

export default function TreinosList({ treinos }: { treinos: Treino[] }) {
  const [tab, setTab] = useState("todos");

  const lista = useMemo(
    () => treinos.filter((t) => tab === "todos" || t.categoria === tab),
    [treinos, tab]
  );

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">Treinos</h1>
          <p className="text-txt2 text-xs">{treinos.length} protocolos</p>
        </div>
        <Link
          href="/treinos/novo"
          className="w-10 h-10 rounded-2xl bg-accent text-bg flex items-center justify-center active:scale-95 transition-all duration-150"
        >
          <IconPlus size={20} />
        </Link>
      </header>

      <TabPills
        tabs={[
          { key: "todos", label: "Todos" },
          { key: "emagrecimento", label: "Emagrecimento" },
          { key: "hipertrofia", label: "Hipertrofia" },
          { key: "funcional", label: "Funcional" },
          { key: "reabilitacao", label: "Reabilitação" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="space-y-3">
        {lista.length === 0 && (
          <Card><p className="text-txt2 text-sm text-center py-4">Nenhum treino nesta categoria.</p></Card>
        )}
        {lista.map((t) => {
          const info = categoriaInfo[t.categoria] ?? categoriaInfo.funcional;
          const Icon = ICONS[t.categoria] ?? IconBarbell;
          const previa = t.exercicios
            .sort((a, b) => a.ordem - b.ordem)
            .slice(0, 3)
            .map((e) => e.nome)
            .join(" · ");
          return (
            <Link key={t.id} href={`/treinos/${t.id}`} className="block">
            <Card className="hover:border-accent/40 transition-all duration-150">
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${info.cor}26` }}
                >
                  <Icon size={22} style={{ color: info.cor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{t.nome}</p>
                  <p className="text-[11px] text-txt2 mt-0.5">
                    {t.exercicios.length} exercícios · {t.duracao_min}min · {t.nivel}
                  </p>
                  {previa && <p className="text-[11px] text-txt2 mt-1.5 truncate">{previa}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                <Badge variant={t.categoria === "emagrecimento" ? "vermelho" : t.categoria === "hipertrofia" ? "roxo" : t.categoria === "funcional" ? "verde" : "amarelo"}>
                  {info.label}
                </Badge>
                <span className="text-[11px] text-txt2 flex items-center gap-1">
                  <IconUsers size={13} /> {t.aluno_treinos.length} {t.aluno_treinos.length === 1 ? "aluno" : "alunos"}
                </span>
              </div>
            </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
