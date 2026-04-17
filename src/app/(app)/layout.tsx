import { NavHeader } from "@/components/layout/nav-header";
import { AttributionFooter } from "@/components/layout/attribution-footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <main className="flex-1">{children}</main>
      <AttributionFooter />
    </div>
  );
}
