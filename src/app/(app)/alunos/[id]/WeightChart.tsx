"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function WeightChart({ data }: { data: { data: string; peso: number }[] }) {
  return (
    <div className="h-44 -ml-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gPeso" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D68F" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#00D68F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1E1E2A" vertical={false} />
          <XAxis dataKey="data" tick={{ fill: "#8888A0", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            domain={["dataMin - 1", "dataMax + 1"]}
            tick={{ fill: "#8888A0", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              background: "#13131C",
              border: "1px solid #1E1E2A",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#8888A0" }}
            formatter={(v: number) => [`${v.toFixed(1).replace(".", ",")} kg`, "Peso"]}
          />
          <Area
            type="monotone"
            dataKey="peso"
            stroke="#00D68F"
            strokeWidth={2.5}
            fill="url(#gPeso)"
            dot={{ fill: "#00D68F", r: 3.5, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
