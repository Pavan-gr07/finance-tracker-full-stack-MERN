import {
    Bell,
    Calendar,
    Home,
    Inbox,
    Search,
    Settings,
    Target,
    Wallet,
    Command // Using a logo icon helps the collapsed state look better
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { SidebarMenuItems } from "./sidebar-menu"

// Menu items.
const items = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Transactions", url: "/transactions", icon: Wallet },
    { title: "Goals", url: "/goals", icon: Target },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Profile Settings", url: "/profile", icon: Settings },
]

export function AppSidebar() {
    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-bold">FinanceTracker</span>
                                    <span className="truncate text-xs">Enterprise</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenuItems />  {/* Use extracted menu */}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            {/* Footer removed because User Menu is moving to Navbar */}
        </Sidebar>
    )
}