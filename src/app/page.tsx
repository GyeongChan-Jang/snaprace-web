import type { Metadata } from "next";
import { headers } from "next/headers";

import { landingContent } from "@/content/landing";

import { EventSearchHome } from "./_components/EventSearchHome";
import { MarketingLanding } from "./_components/MarketingLanding";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const subdomain = headerStore.get("x-organization");

  if (!subdomain) {
    return {
      title: landingContent.meta.title,
      description: landingContent.meta.description,
      openGraph: {
        title: landingContent.meta.title,
        description: landingContent.meta.description,
        type: "website",
        images: [{ url: landingContent.meta.ogImage, alt: landingContent.meta.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: landingContent.meta.title,
        description: landingContent.meta.description,
        images: [landingContent.meta.ogImage],
      },
    } satisfies Metadata;
  }

  return {
    title: "Find your race photos",
    description: "Enter a bib number to browse photos from your latest event.",
  } satisfies Metadata;
}

export default async function HomePage() {
  const headerStore = await headers();
  const subdomain = headerStore.get("x-organization");

  if (!subdomain) {
    return <MarketingLanding />;
  }

  return <EventSearchHome />;
}
