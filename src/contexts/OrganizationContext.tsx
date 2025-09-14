"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/trpc/react";
import type { Organization } from "@/server/api/routers/organizations";
import { oklch } from "culori";

interface OrganizationContextType {
  organization: Organization | null;
  isLoading: boolean;
  subdomain: string | null;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  isLoading: true,
  subdomain: null,
});

export function OrganizationProvider({
  children,
  subdomain,
}: {
  children: ReactNode;
  subdomain: string | null;
}) {
  const [organization, setOrganization] = useState<Organization | null>(null);

  // Fetch organization data by subdomain
  const { data, isLoading } = api.organizations.getBySubdomain.useQuery(
    { subdomain: subdomain || "" },
    {
      enabled: !!subdomain,
      staleTime: 1000 * 60 * 60, // Cache for 1 hour
    },
  );

  useEffect(() => {
    if (data) {
      setOrganization(data);

      // Apply custom theme colors if available
      if (data.primary_color) {
        // Convert hex to oklch using culori
        const primaryOklchColor = oklch(data.primary_color);
        if (primaryOklchColor) {
          // Format oklch values for CSS
          const l = primaryOklchColor.l ?? 0;
          const c = primaryOklchColor.c ?? 0;
          const h = primaryOklchColor.h ?? 0;
          const primaryOklchString = `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`;

          // Set CSS variables for primary colors
          document.documentElement.style.setProperty("--primary", primaryOklchString);

          // Calculate appropriate foreground color (white or black based on lightness)
          const foregroundColor = l > 0.6 ? "oklch(0.1 0 0)" : "oklch(0.98 0 0)";
          document.documentElement.style.setProperty("--primary-foreground", foregroundColor);
        }

        // Keep organization-specific variables for custom use
        document.documentElement.style.setProperty(
          "--organization-primary",
          data.primary_color,
        );
      }

      if (data.secondary_color) {
        // Also convert secondary color to oklch
        const secondaryOklchColor = oklch(data.secondary_color);
        if (secondaryOklchColor) {
          const l = secondaryOklchColor.l ?? 0;
          const c = secondaryOklchColor.c ?? 0;
          const h = secondaryOklchColor.h ?? 0;
          const secondaryOklchString = `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`;

          document.documentElement.style.setProperty("--secondary", secondaryOklchString);
          const secondaryForeground = l > 0.6 ? "oklch(0.1 0 0)" : "oklch(0.98 0 0)";
          document.documentElement.style.setProperty("--secondary-foreground", secondaryForeground);
        }

        document.documentElement.style.setProperty(
          "--organization-secondary",
          data.secondary_color,
        );
      }
    } else {
      // Reset to default colors when no organization
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--primary-foreground");
      document.documentElement.style.removeProperty("--secondary");
      document.documentElement.style.removeProperty("--secondary-foreground");
      document.documentElement.style.removeProperty("--organization-primary");
      document.documentElement.style.removeProperty("--organization-secondary");
    }
  }, [data]);

  return (
    <OrganizationContext.Provider
      value={{ organization, isLoading, subdomain }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider",
    );
  }
  return context;
};
