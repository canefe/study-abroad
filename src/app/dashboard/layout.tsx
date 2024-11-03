import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Footer } from "../_components/footer";
import Header from "../_components/header";
import AppSidebar from "../_components/sidebar";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import App from "next/app";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  // check if the user is admin or not
  if (session?.user.role == "ADMIN") {
    // redirect to dashboard if user is not admin
    redirect("/admin/dashboard");
  }
  return (
    <>
      <SidebarProvider>
        <main className="w-full">
          <Header />
          <AppSidebar />
          <div className="container mx-auto h-screen px-6 py-8">{children}</div>

          <Footer />
        </main>
      </SidebarProvider>
    </>
  );
}
