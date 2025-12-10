"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, getDoc, doc } from "firebase/firestore";
import { Request } from "@/types/firestore";
import Image from "next/image";

export default function MarketPulse() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<Request[]>([]);
    const [responseMap, setResponseMap] = useState<{[key: string]: string}>({});
    const [submittingMap, setSubmittingMap] = useState<{[key: string]: boolean}>({});
    const [successMap, setSuccessMap] = useState<{[key: string]: boolean}>({});

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login");
        } else if (user) {
            fetchOpenRequests();
        }
    }, [user, loading, router]);

    const fetchOpenRequests = async () => {
        try {
            const q = query(
                collection(db, "requests"),
                where("status", "==", "open"),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const items: Request[] = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as Request);
            });
            setRequests(items);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    const handleResponseChange = (requestId: string, value: string) => {
        setResponseMap(prev => ({ ...prev, [requestId]: value }));
    };

    const handleSendResponse = async (request: Request) => {
        if (!user || !request.id) return;
        const message = responseMap[request.id];
        if (!message || message.trim() === "") return;

        setSubmittingMap(prev => ({ ...prev, [request.id!]: true }));

        try {
             // Get user profile for display name
             let displayName = user.displayName || user.email || "Supplier";

             // Try to fetch from users collection for consistent name
             try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.displayName) displayName = userData.displayName;
                }
             } catch (err) {
                 console.warn("Could not fetch user profile, using auth profile", err);
             }

             await addDoc(collection(db, "requests", request.id, "responses"), {
                 supplierId: user.uid,
                 supplierName: displayName,
                 message: message,
                 createdAt: Timestamp.now()
             });

             // Clear input and show success
             setResponseMap(prev => ({ ...prev, [request.id!]: "" }));
             setSuccessMap(prev => ({ ...prev, [request.id!]: true }));

             // Reset success state after 2 seconds
             setTimeout(() => {
                 setSuccessMap(prev => ({ ...prev, [request.id!]: false }));
             }, 2000);

        } catch (error) {
            console.error("Error sending response:", error);
            alert("Failed to send offer. Please try again.");
        } finally {
            setSubmittingMap(prev => ({ ...prev, [request.id!]: false }));
        }
    };

    if (loading || !user) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen p-8 pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <button onClick={() => router.push("/seller-dashboard")} className="tw-button-ghost mb-2">
                             ← Back to Dashboard
                        </button>
                        <h1 className="hero-title text-3xl">Market Pulse</h1>
                        <p className="text-[var(--color-subtle-text)] mt-2">Browse active requests from buyers and send offers.</p>
                    </div>
                </div>

                {requests.length === 0 ? (
                    <div className="text-center text-[var(--color-subtle-text)] py-20">
                        <p>No open requests at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map(req => (
                            <div key={req.id} className="tw-card flex flex-col h-full">
                                <div className="h-48 relative bg-black rounded-[var(--radius-lg)] overflow-hidden mb-4 shrink-0">
                                     {req.imageBase64 ? (
                                        <Image
                                            src={req.imageBase64}
                                            alt={req.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className="tw-tag bg-black/50 backdrop-blur-md border border-white/20">
                                            {req.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-grow mb-4">
                                    <h3 className="font-bold text-lg text-white mb-2">{req.title}</h3>
                                    <p className="text-sm text-[var(--color-subtle-text)] line-clamp-3">{req.description}</p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
                                    <label className="tw-label mb-1">Your Offer</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="tw-input py-2 px-3 text-sm"
                                            placeholder="Price & details..."
                                            value={responseMap[req.id!] || ""}
                                            onChange={(e) => handleResponseChange(req.id!, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !submittingMap[req.id!] && responseMap[req.id!]) {
                                                    handleSendResponse(req);
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => handleSendResponse(req)}
                                            disabled={submittingMap[req.id!] || !responseMap[req.id!]}
                                            className={`tw-button px-4 py-2 h-full aspect-square flex items-center justify-center disabled:opacity-50 transition-all ${successMap[req.id!] ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                        >
                                            {submittingMap[req.id!] ? (
                                                <span className="animate-spin text-lg">↻</span>
                                            ) : successMap[req.id!] ? (
                                                <span className="text-lg font-bold">✓</span>
                                            ) : (
                                                <span className="text-lg">➤</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
