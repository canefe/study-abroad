import {
  Calendar,
  ChevronDown,
  Home,
  Inbox,
  Search,
  Settings,
  User,
} from "lucide-react";

import Image from "next/image";
import Logo from "@/app/assets/logo.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { getServerAuthSession } from "@/server/auth";

// Menu items. That checks ROLE and displays the menu items accordingly
const items = [
  /* 
  ADMIN MENU ITEMS START
  */
  {
    title: "Home",
    url: "/admin/dashboard",
    icon: Home,
    role: "admin",
  },
  {
    title: "Students",
    url: "/admin/dashboard/students",
    icon: User,
    role: "admin",
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    role: "admin",
  },

  /* 
  ADMIN MENU ITEMS END
  */

  /*
  STUDENT MENU ITEMS START
  */
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
    role: "student",
  },
  /*
  STUDENT MENU ITEMS END
  */
];

export default async function AppSidebar() {
  const session = await getServerAuthSession();

  // remove menu items that are not allowed for the user
  const filteredItems = items.filter((item) => {
    if (item.role) {
      return item.role.toLowerCase() === session?.user.role.toLowerCase();
    }
    return true;
  });

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center p-6">
        <Image src={Logo} alt="Logo" width={220} height={40} />
        <h3 className="font-semibold">Study Abroad Portal</h3>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarTrigger />
    </Sidebar>
  );
}
