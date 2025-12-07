"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth-service";
import { toast } from "sonner";

export default function RegisterScreen() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirm: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e: any) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.password !== form.confirm) {
            setError("Passwords do not match.");
            return;
        }
        try {
            await AuthService.register({
                name: form.name,
                email: form.email,
                password: form.password,
            });
            // 2. Success
            toast.success(`Account created successfully!`);
        } catch (error) {
            setError("Registration failed. Please try again.");
            return;
        }

        router.push("/login");
    };

    return (
        <div className="w-full max-w-md p-8 border border-border rounded-xl shadow-md bg-card">
            <h1 className="text-3xl font-bold mb-2 text-center">Create Account</h1>
            <p className="text-muted-foreground text-center mb-6">
                Start managing your finances today
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <label className="block text-sm mb-1">Name</label>
                    <input
                        name="name"
                        type="text"
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md bg-background"
                        placeholder="Your full name"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md bg-background"
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Password</label>
                    <input
                        name="password"
                        type="password"
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md bg-background"
                        placeholder="•••••••••"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Confirm Password</label>
                    <input
                        name="confirm"
                        type="password"
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md bg-background"
                        placeholder="•••••••••"
                        required
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition">
                    Create Account
                </button>
            </form>

            <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium">
                    Login
                </Link>
            </p>
        </div>
    );
}
