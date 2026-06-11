"use client";
import { useEffect, useState } from "react";

type Item = { id: number; msg: string; tipo: "ok" | "erro" };

export function toast(msg: string, tipo: "ok" | "erro" = "ok") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app-toast", { detail: { msg, tipo } }));
  }
}

export default function Toaster() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let seq = 0;
    function onToast(e: Event) {
      const { msg, tipo } = (e as CustomEvent).detail;
      const id = ++seq;
      setItems((cur) => [...cur, { id, msg, tipo }]);
      setTimeout(() => setItems((cur) => cur.filter((i) => i.id !== id)), 3000);
    }
    window.addEventListener("app-toast", onToast);
    return () => window.removeEventListener("app-toast", onToast);
  }, []);

  return (
    <div className="fixed bottom-24 inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
      {items.map((i) => (
        <div
          key={i.id}
          className={`px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg max-w-[420px] text-center ${
            i.tipo === "ok" ? "bg-accent text-bg" : "bg-danger text-white"
          }`}
        >
          {i.msg}
        </div>
      ))}
    </div>
  );
}
