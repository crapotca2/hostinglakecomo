import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { QueryProvider } from "@/components/query-provider";
import { OwnerScopeProvider } from "@/components/owner-scope";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <OwnerScopeProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto scrollbar-thin bg-muted/20">
              {children}
            </main>
          </div>
        </div>
      </OwnerScopeProvider>
    </QueryProvider>
  );
}
