"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { fileToBase64 } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/"); // Redirect to landing if not logged in
    } else if (user) {
      // Fetch user profile
      const fetchProfile = async () => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || "");
          setCurrentImage(data.photoBase64 || null);
        } else {
            // Pre-fill from Auth if firestore doc doesn't exist
            setDisplayName(user.displayName || "");
        }
      };
      fetchProfile();
    }
  }, [user, loading, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setCurrentImage(base64);
      } catch (error) {
        console.error("Error processing image", error);
        setMessage("Error processing image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage("");

    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      const updatedData: any = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoBase64: currentImage || "",
      };

      let userRole = 'buyer';

      if (docSnap.exists()) {
         const data = docSnap.data();
         userRole = data.role || 'buyer';
      } else {
        updatedData.createdAt = Timestamp.now();
        updatedData.role = userRole;
      }

      await setDoc(userRef, updatedData, { merge: true });
      setMessage("Profile updated successfully!");

      // Redirect based on role after short delay
      setTimeout(() => {
          if (userRole === 'seller') {
              router.push('/seller-dashboard');
          } else {
              router.push('/products');
          }
      }, 1000);

    } catch (error) {
      console.error("Error updating profile", error);
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col justify-center">
      <h1 className="hero-title mb-8 text-3xl text-center">Setup Profile</h1>

      <div className="tw-card mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--color-primary)] relative bg-[var(--color-secondary)] shadow-[0_0_20px_rgba(255,214,10,0.2)]">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-[var(--color-subtle-text)]">
                  <span className="text-4xl">👤</span>
                </div>
              )}
            </div>

            <label className="tw-button-secondary cursor-pointer">
              <span>Change Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {!currentImage && <p className="text-xs text-red-500">Profile photo required for virtual try-on.</p>}
          </div>

          {/* Display Name */}
          <div>
            <label className="tw-label">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="tw-input"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="tw-label">Email</label>
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="tw-input opacity-60 cursor-not-allowed"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving || !currentImage}
              className="tw-button w-full"
            >
              {saving ? "Saving..." : "Save & Continue"}
            </button>
            {!currentImage && <p className="text-center text-xs mt-2 text-[var(--color-subtle-text)]">Please upload a photo to continue.</p>}
          </div>

          {message && (
             <p className={`text-center text-sm font-bold ${message.includes("success") ? "text-[var(--color-primary)]" : "text-red-500"}`}>
               {message}
             </p>
          )}

        </form>
      </div>
    </div>
  );
}
