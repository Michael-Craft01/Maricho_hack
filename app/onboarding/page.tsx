"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Onboarding() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = async (role: "buyer" | "seller") => {
        if (!user) return;
        setLoading(true);

        try {
            const idToken = await user.getIdToken();

            // 1. Set the role via API
            const res = await fetch("/api/auth/set-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, idToken }),
            });

            if (!res.ok) throw new Error("Failed to set role");

            // 2. Refresh the user token to get the new claim in the client
            await refreshUser();

            // 3. Update the session (optional but good practice to sync cookie claims) or re-login
            // For simplicity, we just redirect. The middleware checks the cookie.
            // Ideally we re-issue the cookie.
            // Let's re-login to update the session cookie with the new claims!
            const newToken = await user.getIdToken(true);
            await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: newToken }),
            });

            // 4. Redirect
            if (role === "seller") {
                router.push("/seller-dashboard");
            } else {
                router.push("/buyer-dashboard");
            }
        } catch (error) {
            console.error("Error setting role:", error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Welcome, {user?.displayName || "User"}!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please allow us to know you better.
                    </p>
                </div>
                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => handleRoleSelect("buyer")}
                        disabled={loading}
                        className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        I am a Buyer
                    </button>
                    <button
                        onClick={() => handleRoleSelect("seller")}
                        disabled={loading}
                        className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        I am a Seller
                    </button>
                </div>
            </div>
        </div>
    );
}
