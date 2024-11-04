"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const generateBreadcrumb = () => {
    const fullUrl = pathname as string;

    if (!fullUrl) {
      return null;
    }
    const paths = pathname.split("/");

    //capitalize first letter
    const capitalizeFirstLetter = (string: string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return paths.map((path, index) => {
      if (index < 3) {
        return null;
      }
      return (
        <>
          <BreadcrumbItem key={index}>
            <Link href={`${path}`}>{capitalizeFirstLetter(path)}</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </>
      );
    });
  };
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link href="/">Home</Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {generateBreadcrumb()}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
