import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from 'sonner'; // Import Toaster only

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinanceTracker - Manage Your Finances",
  description: "Track your expenses, set goals, and manage your finances efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          {/* 1. Main Application Content */}
          <main className="flex-1  bg-background min-h-screen">
            {children}
          </main>

          {/* 2. The Toaster sits here, ready to listen for events */}
          <Toaster position="top-right" richColors />

        </ThemeProvider>
      </body>
    </html>
  );
}