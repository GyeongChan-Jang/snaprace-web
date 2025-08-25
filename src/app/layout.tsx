import "@/styles/globals.css";

import { type Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Header } from "@/components/header";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${montserrat.variable}`}>
      <body className="m-0 min-h-screen bg-background font-poppins antialiased">
        <TRPCReactProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
