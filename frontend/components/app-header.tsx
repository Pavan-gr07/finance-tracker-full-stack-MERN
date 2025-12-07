"use client";   // IMPORTANT!
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { SidebarMenuItems } from "./sidebar-menu";
import { logout } from "@/utils/auth";
import { AuthService } from "@/services/auth-service";
import { toast } from "sonner";

export function AppHeader() {
    const router = useRouter();
    const handleLogout = async () => {
        try {
            // 1. Call API
            // The Backend remove the 'Set-Cookie' header here automatically.
            await AuthService.logout();

            // 3. Navigate
            router.push("/login");

        } catch (error: any) {
            toast.error(error.message || "Invalid credentials");
        }
    };
    return (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 w-full">
            {/* Desktop Sidebar Trigger */}
            <div className="hidden md:flex items-center gap-2">
                <SidebarTrigger className="-ml-1 cursor-pointer" />
                <Separator orientation="vertical" className="h-4" />
            </div>

            {/* Mobile Menu */}
            <Sheet>
                <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-[260px] p-4">
                    <div className="flex md:hidden items-center gap-2">
                        <div className="flex items-center justify-center rounded-lg bg-primary text-primary-foreground w-8 h-8">
                            <span className="text-sm font-bold">FT</span>
                        </div>
                        <span className="font-bold text-sm">FinanceTracker</span>
                    </div>

                    <SidebarMenuItems />
                </SheetContent>
            </Sheet>


            {/* Logo/Brand for mobile */}
            <div className="flex md:hidden items-center gap-2">
                {/* THIS IS REQUIRED FOR MOBILE SIDEBAR */}
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
                <Button variant="ghost" size="icon" className="relative cursor-pointer" onClick={() => { router.push('/notifications') }}>
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
                        <DropdownMenuItem className="text-red-500 font-medium focus:text-red-500" onClick={handleLogout}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
