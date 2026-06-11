import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AlunoNav from "@/components/AlunoNav";
import Toaster from "@/components/Toast";

export const dynamic = "force-dynamic";

export default async function AlunoLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: aluno } = await supabase
    .from("alunos")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!aluno) redirect("/dashboard");

  return (
    <div className="max-w-[480px] mx-auto min-h-dvh px-4 pt-5 pb-24">
      {children}
      <AlunoNav />
      <Toaster />
    </div>
  );
}
