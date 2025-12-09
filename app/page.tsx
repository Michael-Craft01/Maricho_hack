"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Check if session cookie exists? 
      // We can trust the role in context for redirection logic
      if (role === 'buyer') router.push('/buyer-dashboard');
      else if (role === 'seller') router.push('/seller-dashboard');
      else router.push('/onboarding');
    }
  }, [user, role, loading, router]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Create Session Cookie
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      // Force refresh to ensure we have latest state if needed
      // (The AuthContext listener will pick up the user change, 
      // but the session cookie is now set for middleware)

    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold mb-8">Marketplace Login</h1>
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
}
