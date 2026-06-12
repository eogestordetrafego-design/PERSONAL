import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";

// Digest diário: sessões de hoje + cobranças vencendo hoje, por trainer.
// Protegida por CRON_SECRET (Vercel envia em Authorization: Bearer <secret>).
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!pub || !priv || !serviceKey) {
    return NextResponse.json({ erro: "Variáveis de ambiente faltando" }, { status: 500 });
  }
  webpush.setVapidDetails("mailto:institutovidasaudavel.oficial@gmail.com", pub, priv);

  const supabase = createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const hoje = new Date();
  const ini = new Date(hoje); ini.setHours(0, 0, 0, 0);
  const fim = new Date(hoje); fim.setHours(23, 59, 59, 999);
  const hojeStr = hoje.toISOString().slice(0, 10);

  const [{ data: subs }, { data: sessoes }, { data: cobrancas }] = await Promise.all([
    supabase.from("push_subscriptions").select("trainer_id, aluno_id, endpoint, p256dh, auth"),
    supabase
      .from("sessoes")
      .select("trainer_id, aluno_id, inicio")
      .gte("inicio", ini.toISOString())
      .lte("inicio", fim.toISOString())
      .neq("status", "cancelada")
      .order("inicio"),
    supabase
      .from("pagamentos")
      .select("trainer_id")
      .eq("vencimento", hojeStr)
      .in("status", ["pendente", "atrasado"]),
  ]);

  const sessoesPor = new Map<string, number>();
  const primeiraSessaoAluno = new Map<string, string>();
  (sessoes ?? []).forEach((s) => {
    sessoesPor.set(s.trainer_id, (sessoesPor.get(s.trainer_id) ?? 0) + 1);
    if (!primeiraSessaoAluno.has(s.aluno_id)) primeiraSessaoAluno.set(s.aluno_id, s.inicio);
  });
  const cobrancasPor = new Map<string, number>();
  (cobrancas ?? []).forEach((c) => cobrancasPor.set(c.trainer_id, (cobrancasPor.get(c.trainer_id) ?? 0) + 1));

  let enviadas = 0;
  for (const s of subs ?? []) {
    let payload: string | null = null;

    if (s.trainer_id) {
      const nSess = sessoesPor.get(s.trainer_id) ?? 0;
      const nCob = cobrancasPor.get(s.trainer_id) ?? 0;
      if (nSess === 0 && nCob === 0) continue;
      const partes: string[] = [];
      if (nSess > 0) partes.push(`${nSess} ${nSess === 1 ? "sessão" : "sessões"} hoje`);
      if (nCob > 0) partes.push(`${nCob} ${nCob === 1 ? "cobrança vence" : "cobranças vencem"} hoje`);
      payload = JSON.stringify({
        title: "Bom dia, coach! ☀️",
        body: `Você tem ${partes.join(" e ")}.`,
        url: "/dashboard",
      });
    } else if (s.aluno_id) {
      const inicio = primeiraSessaoAluno.get(s.aluno_id);
      if (!inicio) continue;
      const horario = new Date(inicio).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      });
      payload = JSON.stringify({
        title: "Dia de treino! 💪",
        body: `Sua sessão é hoje às ${horario}. Bora!`,
        url: "/aluno",
      });
    }
    if (!payload) continue;

    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      );
      enviadas++;
    } catch {
      await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
    }
  }
  return NextResponse.json({ enviadas });
}
