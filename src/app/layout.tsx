import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const windsor = localFont({
  src: "../../public/fonts/WindsorProBold.ttf",
  variable: "--font-windsor",
});

export const metadata: Metadata = {
  title: "BrewHub - Brewing Management",
  description: "Manage your beer, cider, and other brewing batches",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${windsor.variable} antialiased`}
      >
        <div className="flex h-svh overflow-hidden">
          <Sidebar />
          <main className="min-h-0 min-w-0 flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}