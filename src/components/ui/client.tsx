"use client";
import { useState } from "react";
import { IconMinus, IconPlus } from "@tabler/icons-react";

export function Counter({
  label,
  initial,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  initial: number;
  step?: number;
  suffix?: string;
  onChange?: (v: number) => void;
}) {
  const [v, setV] = useState(initial);
  const set = (nv: number) => {
    const val = Math.max(0, nv);
    setV(val);
    onChange?.(val);
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-txt2 uppercase font-bold">{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => set(v - step)}
          className="w-7 h-7 rounded-lg bg-line flex items-center justify-center active:scale-90 transition-all duration-150"
        >
          <IconMinus size={13} />
        </button>
        <span className="text-sm font-black w-10 text-center">
          {v}
          {suffix}
        </span>
        <button
          type="button"
          onClick={() => set(v + step)}
          className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center active:scale-90 transition-all duration-150"
        >
          <IconPlus size={13} />
        </button>
      </div>
    </div>
  );
}

export function Toggle({
  initial = false,
  onChange,
}: {
  initial?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const [on, setOn] = useState(initial);
  return (
    <button
      type="button"
      onClick={() => {
        setOn(!on);
        onChange?.(!on);
      }}
      className={`w-12 h-7 rounded-full p-1 transition-all duration-200 ${on ? "bg-accent" : "bg-line"}`}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white transition-all duration-200 ${on ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

export function TabPills({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 ${
            active === t.key ? "bg-accent/15 text-accent" : "bg-card text-txt2 border border-line"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
