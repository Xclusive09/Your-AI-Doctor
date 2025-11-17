import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "HealthBot - AI Doctor & Health Passport",
  description: "AI-powered health assistant with BlockDAG verifiable health credentials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <Navigation />
        <main className="pb-16 md:pb-0 md:pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
