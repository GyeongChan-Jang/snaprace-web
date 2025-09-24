import "@/styles/globals.css";

import { type Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { headers } from "next/headers";

import { OrganizationLoader } from "./organization-loader";
import { OrganizationStyles } from "@/components/OrganizationStyles";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import ClarityInit from "@/components/analytics/ClarityInit";
import { getOrganizationBySubdomain } from "@/lib/server-organization";

export const metadata: Metadata = {
  title: "SnapRace - Find Your Race Photos",
  description:
    "Easily find and download your race photos using your bib number. Powered by Millennium Running.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "SnapRace - Find Your Race Photos",
    description:
      "Easily find and download your race photos using your bib number.",
    type: "website",
    images: [
      {
        url: "/images/og-landing.png",
        alt: "SnapRace - Find Your Race Photos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og-landing.png"],
  },
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Get organization data on server for immediate style application
  const headersList = await headers();
  const subdomain = headersList.get("x-organization");

  let organization = null;
  if (subdomain) {
    try {
      organization = await getOrganizationBySubdomain(subdomain);
    } catch (error) {
      console.error("Failed to fetch organization for styles:", error);
    }
  }

  return (
    <html lang="en" className={`${poppins.variable} ${montserrat.variable}`}>
      <head>
        <OrganizationStyles organization={organization} />
      </head>
      <body className="bg-background font-poppins m-0 min-h-screen antialiased">
        <OrganizationLoader>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </OrganizationLoader>
        {process.env.NODE_ENV === "production" &&
          process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          )}
        <ClarityInit />
      </body>
    </html>
  );
}
