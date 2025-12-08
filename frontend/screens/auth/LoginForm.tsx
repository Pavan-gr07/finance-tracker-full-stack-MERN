"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { isValidToken } from "@/utils/auth";
import { toast } from "sonner";
import { AuthService } from "@/services/auth-service";

export default function LoginScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Call API
            // The Backend sets the 'Set-Cookie' header here automatically.
            await AuthService.login(formData);

            // 2. Success
            toast.success(`Welcome back!`); // Result might not have name depending on your API

            // 3. Navigate
            router.push("/dashboard");

        } catch (error: any) {
            toast.error(error.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="w-full max-w-md p-8 border border-border rounded-xl shadow-md bg-card">
            <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
            <p className="text-muted-foreground text-center mb-6">
                Login to your Finance Tracker account
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        className="w-full p-3 border rounded-md bg-background"
                        placeholder="you@example.com"
                        value={formData?.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        className="w-full p-3 border rounded-md bg-background"
                        placeholder="•••••••••"
                        value={formData?.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>

                <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition cursor-pointer" type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                </button>
            </form>

            {/* Social Login */}
            <div className="my-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-px bg-border flex-1" />
                    <span className="text-muted-foreground text-sm">OR</span>
                    <div className="h-px bg-border flex-1" />
                </div>

                <button className="w-full py-2 border rounded-md flex items-center justify-center gap-2 hover:bg-accent transition">
                    <Image
                        src="./google.svg"
                        alt="google"
                        width={20}
                        height={20}
                        priority
                    />
                    Continue with Google
                </button>
            </div>

            {/* Link to register */}
            <p className="text-center text-sm mt-4">
                Don’t have an account?{" "}
                <Link href="/register" className="text-primary font-medium">
                    Create Account
                </Link>
            </p>
        </div>
    );
}
