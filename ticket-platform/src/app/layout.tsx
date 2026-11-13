import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { UpcomingEventPopup } from "@/components/layout/UpcomingEventPopup";
import { WelcomeSplash } from "@/components/layout/WelcomeSplash";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TicketHub - Buy Tickets for Events",
  description: "Your one-stop platform for buying event tickets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-50 antialiased dark:bg-[#0b0d12]`}>
        <Providers>
          <div className="flex min-h-screen flex-col pb-16 md:pb-0">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <MobileBottomNav />
          <UpcomingEventPopup />
          <WelcomeSplash />
        </Providers>
      </body>
    </html>
  );
}
