import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import ActivityTracker from "@/components/ActivityTracker"; // <--- Ensure this is imported
import { Suspense } from "react"; // <--- Import Suspense
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
  title: "Arguely",
  description: "Structured Rational Discourse",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-black text-slate-300`}>

        {/* 1. Add Navbar here */}
        <Navbar />

        {/* 2. Add Activity Tracker Wrapped in Suspense */}
        {/* This fixes the "useSearchParams" build error */}
        <Suspense fallback={null}>
           <ActivityTracker />
        </Suspense>

        {/* 3. Main Wrapper */}
        <main className="flex-1 relative pt-16">
          {children}
        </main>

      </body>
    </html>
  );
}