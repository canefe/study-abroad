import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Footer } from "@/app/_components/footer";
import Header from "@/app/_components/header";
import AppSidebar from "@/app/_components/sidebar";
import { getServerAuthSession } from "@/server/auth";
import { redirect, usePathname } from "next/navigation";

import { headers } from "next/headers";
import Breadcrumbs from "./_sections/breadcrumb";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  // check if the user is admin or not
  if (session?.user.role != "ADMIN") {
    // redirect to dashboard if user is not admin
    redirect("/dashboard");
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <main className="px-3 py-6">
          <Breadcrumbs />
          <div className="h-screen min-h-screen">{children}</div>

          <Footer />
        </main>
      </SidebarProvider>
    </>
  );
}
