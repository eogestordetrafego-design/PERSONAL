"use client";
import { IconPrinter } from "@tabler/icons-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 text-xs font-bold bg-accent text-bg rounded-2xl px-4 py-2.5 active:scale-95 transition-all duration-150"
    >
      <IconPrinter size={16} /> Imprimir / PDF
    </button>
  );
}
