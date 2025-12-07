"use client";

import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"

import { Home, Wallet, Target, Bell, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Transactions", url: "/transactions", icon: Wallet },
    { title: "Budget & Goals", url: "/goals", icon: Target },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Profile Settings", url: "/profile", icon: Settings },
];

export function SidebarMenuItems() {
    const pathname = usePathname();

    return (
        <SidebarMenu>
            {items.map((item) => {
                const isActive = pathname.startsWith(item.url);

                return (
                    <SidebarMenuItem key={item.title} >
                        <SidebarMenuButton
                            asChild
                            // ShadCN active state support
                            data-active={isActive ? "true" : undefined}

                        >
                            <Link href={item.url}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
