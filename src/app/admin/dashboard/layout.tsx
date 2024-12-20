import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Footer } from "@/app/_components/footer";
import Header from "@/app/_components/header";
import AppSidebar from "@/app/_components/sidebar";
import { getServerAuthSession } from "@/server/auth";
import { redirect, usePathname } from "next/navigation";

import { headers } from "next/headers";
import Breadcrumbs from "./_sections/breadcrumb";
import UserAvatar from "@/app/dashboard/_sections/avatar";
import { Toaster } from "react-hot-toast";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  console.log(session);
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
        <main className="flex w-full flex-col items-center px-6 py-6">
          <div className="container flex w-full items-center justify-between border-b pr-3">
            <div className="flex w-full items-center justify-between">
              <div className="w-full flex-1">
                <Breadcrumbs />
              </div>
              <div className="mb-3">
                <UserAvatar />
              </div>
            </div>
          </div>
          <div className="mt-4 flex w-full items-center justify-center">
            <div className="container">{children}</div>
          </div>
        </main>
      </SidebarProvider>
      <Toaster />
    </>
  );
}
