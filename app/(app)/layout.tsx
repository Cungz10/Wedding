import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-ivory pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
