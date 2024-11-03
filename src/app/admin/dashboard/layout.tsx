"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Footer } from "@/app/_components/footer";
import Header from "@/app/_components/header";
import AppSidebar from "@/app/_components/sidebar";
import { getServerAuthSession } from "@/server/auth";
import { redirect, usePathname } from "next/navigation";

import { headers } from "next/headers";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  // check if the user is admin or not

  //rerender the component when the pathname changes

  const generateBreadcrumb = () => {
    const fullUrl = pathname as string;

    if (!fullUrl) {
      return null;
    }
    const paths = pathname.split("/");

    //capitalize first letter
    const capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return paths.map((path, index) => {
      if (index < 3) {
        return null;
      }
      return (
        <BreadcrumbItem key={index}>
          <Link href={`/${path}`}>{capitalizeFirstLetter(path)}</Link>
        </BreadcrumbItem>
      );
    });
  };

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <main className="px-3 py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link href="/">Home</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {generateBreadcrumb()}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="h-screen min-h-screen">{children}</div>

          <Footer />
        </main>
      </SidebarProvider>
    </>
  );
}
