"use client";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ExecucaoPonto = { nome: string; carga: number; data: string };

export default function CargaChart({ pontos }: { pontos: ExecucaoPonto[] }) {
  const exercicios = useMemo(() => {
    const contagem = new Map<string, number>();
    pontos.forEach((p) => contagem.set(p.nome, (contagem.get(p.nome) ?? 0) + 1));
    return Array.from(contagem.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([nome]) => nome);
  }, [pontos]);

  const [exercicio, setExercicio] = useState(exercicios[0] ?? "");

  const dados = useMemo(
    () =>
      pontos
        .filter((p) => p.nome === exercicio)
        .sort((a, b) => a.data.localeCompare(b.data))
        .map((p) => ({
          data: new Date(p.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          carga: p.carga,
        })),
    [pontos, exercicio]
  );

  if (exercicios.length === 0) return null;

  return (
    <div className="space-y-3">
      <select className="input !py-2.5 text-xs" value={exercicio} onChange={(e) => setExercicio(e.target.value)}>
        {exercicios.map((nome) => (
          <option key={nome} value={nome}>{nome}</option>
        ))}
      </select>
      <div className="h-40 -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados}>
            <CartesianGrid stroke="#1E1E2A" vertical={false} />
            <XAxis dataKey="data" tick={{ fill: "#8888A0", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              tick={{ fill: "#8888A0", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={34}
            />
            <Tooltip
              contentStyle={{ background: "#13131C", border: "1px solid #1E1E2A", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "#8888A0" }}
              formatter={(v: number) => [`${v} kg`, "Carga"]}
            />
            <Line
              type="monotone"
              dataKey="carga"
              stroke="#7B6EF6"
              strokeWidth={2.5}
              dot={{ fill: "#7B6EF6", r: 3.5, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
