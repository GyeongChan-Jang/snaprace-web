import "@/styles/globals.css";

import { type Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import { headers } from 'next/headers';

import { LayoutProviders } from "@/components/providers/LayoutProviders";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import ClarityInit from "@/components/analytics/ClarityInit";

export const metadata: Metadata = {
  title: "SnapRace - Find Your Race Photos",
  description: "Easily find and download your race photos using your bib number. Powered by Millennium Running.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "SnapRace - Find Your Race Photos",
    description: "Easily find and download your race photos using your bib number.",
    type: "website",
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
  // Get subdomain from headers (set by middleware)
  const headersList = await headers();
  const subdomain = headersList.get('x-organization');

  return (
    <html lang="en" className={`${poppins.variable} ${montserrat.variable}`}>
      <body className="m-0 min-h-screen bg-background font-poppins antialiased">
        <LayoutProviders subdomain={subdomain}>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </LayoutProviders>
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <ClarityInit />
      </body>
    </html>
  );
}
