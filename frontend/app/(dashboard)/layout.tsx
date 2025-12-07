// app/(dashboard)/layout.tsx

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: {
    children: ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="hidden md:block">
                <AppSidebar />
            </div>

            <SidebarInset>
                <AppHeader />
                <main className="flex-1 overflow-y-auto bg-background">
                    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
