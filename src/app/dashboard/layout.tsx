import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Footer } from "../_components/footer";
import Header from "../_components/header";
import AppSidebar from "../_components/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />

        <main className="w-full">
          <Header />
          <SidebarTrigger />

          <div className="container mx-auto px-6 py-8">{children}</div>

          <Footer />
        </main>
      </SidebarProvider>
    </>
  );
}
