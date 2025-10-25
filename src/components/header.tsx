"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu } from "lucide-react";

import { landingContent } from "@/content/landing";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrganizationHelper } from "@/hooks/useOrganizationHelper";
import { getOrganizationAssets } from "@/utils/organization-assets";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const org = useOrganizationHelper();
  const { isDefaultSite, subdomain } = useOrganization();
  const assets = getOrganizationAssets(org.subdomain);

  // Disable sticky on photo detail pages: /events/[event]/[bib]
  const isPhotoPage = /^\/events\/[^/]+\/[^/]+$/.test(pathname);

  const marketingNavigation = [
    { name: "Product", href: "#features" },
    { name: "How it works", href: "#process" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  const portalNavigation = [
    { name: "Search", href: "/" },
    { name: "Events", href: "/events" },
  ];

  const navigation = isDefaultSite ? marketingNavigation : portalNavigation;
  const primaryCta = isDefaultSite
    ? { label: landingContent.hero.primaryCta.label, href: "#cta" }
    : null;

  const renderLogo = (
    <div className="flex items-center space-x-2">
      {subdomain ? (
        <div className="relative h-10 w-32">
          <Image
            src={assets.logo}
            alt={org.name}
            fill
            className="object-contain"
            priority
          />
        </div>
      ) : (
        <span className="text-foreground text-xl font-bold">SnapRace</span>
      )}
    </div>
  );

  return (
    <header
      className={`${isPhotoPage ? "" : "sticky top-0 z-50"} bg-background/80 w-full border-b backdrop-blur-sm`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/">{renderLogo}</Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => {
              const isAnchor = item.href.startsWith("#");
              const isActive = isAnchor
                ? pathname === "/"
                : pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

              const navLinkClass = `text-sm transition-colors ${
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`;

              return (
                <Link key={item.name} href={item.href} className={navLinkClass}>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {primaryCta && (
            <div className="hidden md:flex">
              <Button size="sm" className="shadow-sm" asChild>
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
            </div>
          )}

          <div className="flex items-center md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Open menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] px-2 sm:w-[360px]">
                <div className="flex flex-col space-y-4 pt-6">
                  <Link href="/" onClick={() => setIsSheetOpen(false)}>
                    {renderLogo}
                  </Link>
                  <nav className="flex flex-col space-y-3">
                    {navigation.map((item) => {
                      const isAnchor = item.href.startsWith("#");
                      const isActive = isAnchor
                        ? pathname === "/"
                        : pathname === item.href ||
                          (item.href !== "/" && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`text-lg transition-colors ${
                            isActive
                              ? "text-foreground font-semibold"
                              : "text-muted-foreground hover:text-foreground font-medium"
                          }`}
                          onClick={() => setIsSheetOpen(false)}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                  {primaryCta && (
                    <div className="border-t pt-6">
                      <Button className="w-full" size="lg" asChild>
                        <Link href={primaryCta.href}>
                          {primaryCta.label}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
