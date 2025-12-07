import { ThemeProvider } from "@/components/theme-provider";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (

        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="theme"
        >
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                {children}
            </div>
        </ThemeProvider>

    );
}
