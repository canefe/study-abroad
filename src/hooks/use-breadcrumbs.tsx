import { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { capitalizeFirstLetter } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function useBreadcrumbs() {
  const pathname = usePathname();

  function generateBreadcrumb(pathName: string) {
    const formatBreadcrumb = (breadcrumb: string) => {
      return capitalizeFirstLetter(breadcrumb.replace(/-/g, " "));
    };

    const fullUrl = pathName as string;

    if (!fullUrl) {
      return null;
    }
    const paths = pathName.split("/");
    const indexSkip = paths.includes("admin") ? 3 : 2;

    // custom breadcrumb for My choices page

    if (paths.includes("my-choices")) {
      return (
        <>
          <BreadcrumbItem>
            <Link href={pathname}>My Choices</Link>
          </BreadcrumbItem>
        </>
      );
    }

    return paths.map((path, index) => {
      if (index < indexSkip) {
        return null;
      }
      return (
        <BreadcrumbItem key={index}>
          <Link href={`/${path}`}>{formatBreadcrumb(path)}</Link>
        </BreadcrumbItem>
      );
    });
  }

  return generateBreadcrumb(pathname);
}
