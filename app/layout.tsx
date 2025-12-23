// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar"; 
import ActivityTracker from "@/components/ActivityTracker"; // <--- IMPORT TRACKER
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

        {/* 2. Add Activity Tracker (Runs on every page) */}
        <ActivityTracker />

        {/* 3. Add this main wrapper */}
        {/* The 'pt-16' ensures content isn't hidden behind the fixed navbar */}
        <main className="flex-1 relative pt-16">
          {children}
        </main>

      </body>
    </html>
  );
}