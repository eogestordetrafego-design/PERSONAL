"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconCheck } from "@tabler/icons-react";

export default function FinanceiroAcoes({ id }: { id: string }) {
  const router = useRouter();
  async function marcarPago() {
    const supabase = createClient();
    await supabase
      .from("pagamentos")
      .update({ status: "pago", pago_em: new Date().toISOString().slice(0, 10), metodo: "Pix" })
      .eq("id", id);
    router.refresh();
  }
  return (
    <button
      onClick={marcarPago}
      title="Marcar como pago"
      className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center active:scale-90 transition-all duration-150"
    >
      <IconCheck size={16} />
    </button>
  );
}
