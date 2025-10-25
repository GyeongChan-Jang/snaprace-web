import { headers } from "next/headers";
import { LayoutProviders } from "@/components/providers/LayoutProviders";
import { getOrganizationBySubdomain } from "@/lib/server-organization";
import type { ReactNode } from "react";

export async function OrganizationLoader({ children }: { children: ReactNode }) {
  const headerStore = await headers();
  const subdomain = headerStore.get("x-organization");

  if (!subdomain) {
    return <LayoutProviders subdomain={null}>{children}</LayoutProviders>;
  }

  let initialOrganization = null;
  try {
    initialOrganization = await getOrganizationBySubdomain(subdomain);
  } catch (error: unknown) {
    console.error(
      "Failed to fetch organization:",
      error instanceof Error ? error.message : String(error)
    );
  }

  return (
    <LayoutProviders subdomain={subdomain} initialOrganization={initialOrganization}>
      {children}
    </LayoutProviders>
  );
}
