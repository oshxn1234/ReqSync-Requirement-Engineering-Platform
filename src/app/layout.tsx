import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReqSync - Requirement Engineering Platform",
  description: "Intelligent web-based Requirement Engineering and Collaboration Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-slate-50 text-slate-900 flex overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
          <Header />
          <main className="flex-grow overflow-y-auto p-8 scrollbar-thin">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
