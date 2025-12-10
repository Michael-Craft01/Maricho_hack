"use client";

import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingProfile, setCheckingProfile] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setCheckingProfile(true);
      const checkProfileAndRedirect = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
             const userData = userDoc.data();
             if (userData.photoBase64) {
                 // Profile is set up
                 if (userData.role === 'seller') {
                     router.push('/seller-dashboard');
                 } else {
                     router.push('/products');
                 }
             } else {
                 // Profile exists but no photo (incomplete)
                 router.push('/profile');
             }
          } else {
             // No profile doc yet
             router.push('/profile');
          }
        } catch (error) {
            console.error("Error checking profile:", error);
            // Fallback to profile on error
            router.push('/profile');
        } finally {
            setCheckingProfile(false);
        }
      };

      checkProfileAndRedirect();
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // The auth state change will trigger the useEffect above
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (loading || checkingProfile) {
      return (
        <div className="h-screen w-screen bg-[var(--color-background)] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
                <p className="text-[var(--color-subtle-text)] font-mono text-sm uppercase tracking-widest">Loading Maricho...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col items-center justify-center p-8 relative">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-primary)] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center text-center max-w-md w-full space-y-8">
          <div className="mb-4">
              <h1 className="hero-title text-6xl md:text-7xl mb-2 text-[var(--color-primary)]">Maricho</h1>
              <p className="text-xl md:text-2xl font-light text-[var(--color-subtle-text)] tracking-wide">
                  Frictionless Verified Trade Network for the Zimbabwean Youths
              </p>
          </div>

          <div className="tw-card w-full bg-[var(--color-secondary)]/50 backdrop-blur-sm border-[var(--color-border)] p-8">
              <p className="text-[var(--color-foreground)] opacity-80 mb-8 leading-relaxed">
                  Experience the future of marketplace shopping with our AI-powered Virtual Mirror. Try it before you buy it.
              </p>

              <button
                onClick={handleLogin}
                className="tw-button w-full text-lg shadow-[0_4px_20px_rgba(255,214,10,0.3)] hover:shadow-[0_4px_30px_rgba(255,214,10,0.5)] transform hover:scale-105 transition-all duration-300"
              >
                Login with Google
              </button>
          </div>

          <p className="text-xs text-[var(--color-subtle-text)] opacity-50 mt-8">
              By logging in, you agree to our Terms of Service.
          </p>
      </div>
    </div>
  );
}
