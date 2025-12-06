import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell, User2, ChevronDown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          <SidebarProvider>
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <AppSidebar />
            </div>

            <SidebarInset className="w-full">
              {/* Navbar */}
              <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 w-full">
                {/* Desktop Sidebar Trigger */}
                <div className="hidden md:flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="h-4" />
                </div>

                {/* Mobile Menu */}
                <Sheet>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon" className="-ml-2">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] p-0">
                    <AppSidebar />
                  </SheetContent>
                </Sheet>

                {/* Logo/Brand for mobile */}
                <div className="flex md:hidden items-center gap-2">
                  <div className="flex items-center justify-center rounded-lg bg-primary text-primary-foreground w-8 h-8">
                    <span className="text-sm font-bold">FT</span>
                  </div>
                  <span className="font-bold text-sm">FinanceTracker</span>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Right side of Navbar */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Notification Icon */}
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                    <span className="sr-only">Notifications</span>
                  </Button>

                  {/* Theme Toggle */}
                  <ModeToggle />

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 px-2 h-10">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ring-2 ring-transparent hover:ring-primary/20 transition-all">
                          <User2 className="h-4 w-4" />
                        </div>
                        <span className="hidden lg:block text-sm font-medium">Username</span>
                        <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center gap-2 p-2">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User2 className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">Username</p>
                          <p className="text-xs text-muted-foreground">user@example.com</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuItem>Billing</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500 font-medium focus:text-red-500">
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto bg-background">
                <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                  {children}
                </div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}