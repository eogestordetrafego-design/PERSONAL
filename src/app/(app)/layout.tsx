import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[480px] mx-auto min-h-dvh px-4 pt-5 pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
