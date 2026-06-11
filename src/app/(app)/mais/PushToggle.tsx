"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/Toast";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from(raw.split("").map((c) => c.charCodeAt(0)));
}

export default function PushToggle() {
  const [ativo, setAtivo] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [suportado, setSuportado] = useState(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSuportado(false);
      return;
    }
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      const sub = await reg?.pushManager.getSubscription();
      setAtivo(!!sub && Notification.permission === "granted");
    });
  }, []);

  async function alternar() {
    if (ocupado || !suportado) return;
    setOcupado(true);
    const supabase = createClient();
    try {
      if (!ativo) {
        const chave = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!chave) {
          toast("Chave VAPID não configurada", "erro");
          return;
        }
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          toast("Permissão de notificação negada", "erro");
          return;
        }
        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(chave),
        });
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const json = sub.toJSON();
        const { error } = await supabase.from("push_subscriptions").upsert(
          {
            trainer_id: user!.id,
            endpoint: sub.endpoint,
            p256dh: json.keys!.p256dh,
            auth: json.keys!.auth,
          },
          { onConflict: "endpoint" }
        );
        if (error) {
          toast("Erro ao salvar inscrição", "erro");
          return;
        }
        setAtivo(true);
        toast("Notificações ativadas ✓");
        fetch("/api/push/test", { method: "POST" });
      } else {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (sub) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          await sub.unsubscribe();
        }
        setAtivo(false);
        toast("Notificações desativadas");
      }
    } finally {
      setOcupado(false);
    }
  }

  if (!suportado) return <span className="text-[11px] text-txt2">Sem suporte</span>;

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={ocupado}
      className={`w-12 h-7 rounded-full p-1 transition-all duration-200 ${ativo ? "bg-accent" : "bg-line"} disabled:opacity-50`}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white transition-all duration-200 ${ativo ? "translate-x-5" : ""}`}
      />
    </button>
  );
}
