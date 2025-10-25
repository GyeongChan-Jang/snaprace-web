"use client";

import Image from "next/image";
import Link from "next/link";

import { landingContent } from "@/content/landing";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrganizationHelper } from "@/hooks/useOrganizationHelper";

export function Footer() {
  const org = useOrganizationHelper();
  const { isDefaultSite } = useOrganization();

  if (isDefaultSite) {
    const { footer, hero } = landingContent;

    return (
      <footer className="bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <Link href="/" className="text-2xl font-semibold tracking-tight">
                SnapRace
              </Link>
              <p className="text-sm text-slate-300">
                Mobile-first race photo delivery and monetization.
              </p>
              <div className="flex flex-col gap-3 text-sm text-slate-200">
                <Link href={hero.secondaryCta.href} className="hover:text-white">
                  Book a demo
                </Link>
                <Link href={hero.primaryCta.href} className="hover:text-white">
                  Start free trial
                </Link>
              </div>
            </div>
            {[footer.company, footer.product, footer.resources].map((column) => (
              <div key={column.headline} className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {column.headline}
                </p>
                <ul className="space-y-2 text-sm text-slate-300">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} SnapRace. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="mailto:support@snap-race.com" className="hover:text-white">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <section className="bg-muted/10 mt-auto border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:py-4">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-[10px] sm:text-xs">
            <Link
              href="/privacy-policy"
              className="hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="hidden sm:inline">•</span>
            <span>
              © {new Date().getFullYear()} {org.name}. All rights reserved.
            </span>
          </div>

          {org.partners.length > 0 && (
            <div className="flex max-w-full items-center justify-center gap-3 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-end">
              {org.partners.map((partner) => (
                <Link
                  key={partner.id}
                  href={partner.website_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-shrink-0"
                >
                  <div className="relative flex h-8 w-fit max-w-[120px] items-center justify-center">
                    <Image
                      src={org.getPartnerImageUrl(partner)}
                      alt={partner.name}
                      width={120}
                      height={32}
                      className="max-h-8 w-auto object-contain opacity-70 transition-all duration-200 group-hover:opacity-100 group-hover:scale-105"
                      sizes="120px"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
