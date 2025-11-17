import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "HealthBot - AI Doctor & Health Passport",
  description: "Privacy-first AI doctor and verifiable health passport powered by BlockDAG",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HealthBot",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased font-sans bg-gray-900 text-white">
        <Providers>
          <Navigation />
          <main className="pb-16 md:pb-0 md:pt-16">
            {children}
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white',
              duration: 3000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
