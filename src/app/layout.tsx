import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { WorkspaceProvider } from "@/context/workspace-context";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AtlasOps AI — Operations Intelligence",
  description:
    "AI-Powered Business Operations Intelligence Platform for travel operations analytics, revenue intelligence, and agent performance monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
          <WorkspaceProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col min-h-screen lg:ml-[220px]">
                <Header />
                <main className="flex-1 px-4 lg:px-6 py-3 lg:py-4 overflow-auto">{children}</main>
              </div>
            </div>
          </WorkspaceProvider>
      </body>
    </html>
  );
}
