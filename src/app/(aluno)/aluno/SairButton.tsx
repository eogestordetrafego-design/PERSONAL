"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconLogout } from "@tabler/icons-react";

export default function SairButton() {
  const router = useRouter();
  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      onClick={sair}
      title="Sair"
      className="w-10 h-10 rounded-2xl bg-card border border-line flex items-center justify-center text-txt2"
    >
      <IconLogout size={18} />
    </button>
  );
}
