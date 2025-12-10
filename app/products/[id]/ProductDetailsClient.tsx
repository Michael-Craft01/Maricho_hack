"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types/firestore";
import Mirror from "@/app/components/mirror";
import Image from "next/image";

export default function ProductDetailsClient({ product }: { product: Product }) {
    const { user } = useAuth();
    const [userPhotoBase64, setUserPhotoBase64] = useState<string | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserPhotoBase64(data.photoBase64 || null);
                    }
                } catch (error) {
                    console.error("Error fetching user profile for mirror:", error);
                } finally {
                    setLoadingProfile(false);
                }
            };
            fetchProfile();
        } else {
            setLoadingProfile(false);
        }
    }, [user]);

    const canTryOn = userPhotoBase64 && product.imageBase64;
    const prompt = `A high-quality, photorealistic image of the person from the first image wearing the ${product.name} from the second image. Ensure the lighting is natural and flattering. Preserve the person's facial features, body shape, and skin tone exactly. The clothing should fit naturally and look premium.`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Images */}
            <div className="space-y-8">
                {/* 1. Virtual Try-On (Main Focus) */}
                {loadingProfile ? (
                     <div className="tw-card min-h-[400px] flex items-center justify-center animate-pulse">
                        <span className="text-[var(--color-subtle-text)]">Checking mirror compatibility...</span>
                     </div>
                ) : canTryOn ? (
                    <div className="w-full">
                         <h3 className="tw-label mb-2 text-[var(--color-primary)]">Virtual Mirror</h3>
                         <Mirror
                            userPhoto={userPhotoBase64}
                            productPhoto={product.imageBase64}
                            prompt={prompt}
                         />
                    </div>
                ) : (
                    // Fallback or promo if they can't try on (e.g. not logged in or no photo)
                    <div className="tw-card bg-[var(--color-secondary)] p-8 text-center border-dashed border-2 border-[var(--color-border)]">
                        <p className="text-[var(--color-subtle-text)] mb-4">
                            {!user ? "Log in to try this on virtually!" : "Upload a profile photo to use the Virtual Mirror."}
                        </p>
                    </div>
                )}

                {/* 2. Original Product Image (Displayed Below) */}
                <div className="tw-card-product p-8 flex items-center justify-center min-h-[300px] relative opacity-80 hover:opacity-100 transition-opacity">
                    <div className="relative w-full h-full aspect-square">
                        {product.imageBase64 ? (
                            <Image
                                src={product.imageBase64}
                                alt={product.name}
                                fill
                                className="object-contain"
                            />
                        ) : (
                             <div className="flex items-center justify-center w-full h-full text-gray-500">No Image</div>
                        )}
                    </div>
                    <div className="absolute bottom-4 left-4 tw-tag bg-black/50 backdrop-blur-md">Original Product</div>
                </div>
            </div>

            {/* Right Column: Details */}
            <div className="flex flex-col justify-center space-y-8">
                <div>
                    <h1 className="hero-title text-4xl lg:text-5xl mb-4 text-white uppercase">{product.name}</h1>
                    <div className="flex items-center gap-4 mb-4">
                         <span className="tw-tag text-sm px-4 py-2">{product.category}</span>
                    </div>
                    <p className="text-[var(--color-primary)] font-mono text-3xl font-bold">${product.price}</p>
                </div>

                <div className="space-y-4">
                    <h2 className="tw-label text-sm">Description</h2>
                    <p className="text-[var(--color-foreground)] opacity-80 leading-relaxed text-lg">
                        {product.description}
                    </p>
                </div>

                <div className="pt-8 space-y-4">
                    <button className="tw-button w-full text-lg shadow-[0_0_20px_rgba(255,214,10,0.4)]">
                        Add to Cart
                    </button>
                    {!canTryOn && user && (
                        <a href="/profile" className="tw-button-secondary w-full text-center block">
                            Update Profile for Virtual Try-On
                        </a>
                    )}
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                     <div className="flex items-center gap-2 text-sm text-[var(--color-subtle-text)]">
                        <span>Sold by:</span>
                        <span className="text-white font-semibold">Seller ID: {product.sellerId.substring(0, 6)}...</span>
                     </div>
                </div>
            </div>
        </div>
    );
}
