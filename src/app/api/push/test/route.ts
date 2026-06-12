import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    return NextResponse.json({ erro: "VAPID não configurado" }, { status: 500 });
  }
  webpush.setVapidDetails("mailto:institutovidasaudavel.oficial@gmail.com", pub, priv);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  // trainer ou aluno?
  const { data: aluno } = await supabase
    .from("alunos")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const query = supabase.from("push_subscriptions").select("endpoint, p256dh, auth");
  const { data: subs } = aluno
    ? await query.eq("aluno_id", aluno.id)
    : await query.eq("trainer_id", user.id);

  const payload = JSON.stringify({
    title: "FitCoach Pro 🔔",
    body: "Notificações ativadas com sucesso!",
    url: "/dashboard",
  });

  let enviadas = 0;
  for (const s of subs ?? []) {
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
