"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function SellerDashboard() {
    const { user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await auth.signOut();
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
                    <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-lg">Welcome back, {user?.email}!</p>
                    <div className="mt-4 p-4 bg-green-50 text-green-700 rounded">
                        You have access to Seller features (Analytics, Inventory, etc).
                    </div>
                </div>
            </div>
        </div>
    );
}
