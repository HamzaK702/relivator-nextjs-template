import type { Metadata } from "next";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";

import { prefetchStoreSettings } from "~/lib/fetchStoreSettings";
import { CartProvider } from "~/lib/hooks/use-cart";
import "~/css/globals.css";
import { Footer } from "~/ui/components/footer";
import { Header } from "~/ui/components/header";
import { ThemeProvider } from "~/ui/components/theme-provider";
import { Toaster } from "~/ui/primitives/sonner";

import { Providers } from "./providers";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  description: "Relivator",
  title: "Relivator",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dehydratedState = await prefetchStoreSettings();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
        `}
        suppressHydrationWarning
      >
        <Providers dehydratedState={dehydratedState}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <CartProvider>
              <Header showAuth={true} />
              <main className="flex min-h-screen flex-col">{children}</main>
              <Footer />
              <Toaster />
            </CartProvider>
          </ThemeProvider>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
