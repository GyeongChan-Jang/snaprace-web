"use client";

import { type ReactNode } from "react";
import { TRPCReactProvider } from "@/trpc/react";
import { OrganizationProvider } from "@/contexts/OrganizationContext";

interface LayoutProvidersProps {
  children: ReactNode;
  subdomain: string | null;
}

export function LayoutProviders({ children, subdomain }: LayoutProvidersProps) {
  return (
    <TRPCReactProvider>
      <OrganizationProvider subdomain={subdomain}>
        {children}
      </OrganizationProvider>
    </TRPCReactProvider>
  );
}
