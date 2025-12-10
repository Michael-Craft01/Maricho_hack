"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, updateDoc, doc } from "firebase/firestore";
import { fileToBase64 } from "@/lib/utils";
import { Request, RequestResponse } from "@/types/firestore";
import Image from "next/image";

// Helper component for displaying responses
const RequestResponses = ({ requestId }: { requestId: string }) => {
    const [responses, setResponses] = useState<RequestResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const q = query(
                    collection(db, "requests", requestId, "responses"),
                    orderBy("createdAt", "asc")
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RequestResponse));
                setResponses(data);
            } catch (err) {
                console.error("Error fetching responses:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResponses();
    }, [requestId]);

    if (loading) return <div className="text-sm text-gray-500">Loading responses...</div>;
    if (responses.length === 0) return <div className="text-sm text-gray-500">No responses yet.</div>;

    return (
        <div className="mt-4 space-y-3 pl-4 border-l-2 border-[var(--color-border)]">
            {responses.map((res) => (
                <div key={res.id} className="bg-[var(--color-secondary)] p-3 rounded-lg">
                    <p className="text-xs font-bold text-[var(--color-primary)]">{res.supplierName}</p>
                    <p className="text-sm text-white mt-1">{res.message}</p>
                </div>
            ))}
        </div>
    );
};

export default function BuyerDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<Request[]>([]);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
    const [formMessage, setFormMessage] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login");
        } else if (user) {
            fetchRequests(user.uid);
        }
    }, [user, loading, router]);

    const fetchRequests = async (uid: string) => {
        try {
            const q = query(
                collection(db, "requests"),
                where("buyerId", "==", uid),
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

    const handleLogout = async () => {
        await auth.signOut();
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
    };

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!imageFile) {
             setFormMessage("Please select an image.");
             return;
        }

        setIsSubmitting(true);
        setFormMessage("");

        try {
            const base64 = await fileToBase64(imageFile);

            const newRequest: Request = {
                buyerId: user.uid,
                title,
                description,
                imageBase64: base64,
                status: 'open',
                createdAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, "requests"), newRequest);

            setRequests([{ id: docRef.id, ...newRequest }, ...requests]);

            // Reset form
            setTitle("");
            setDescription("");
            setImageFile(null);
            setFormMessage("Request posted successfully!");
        } catch (error) {
            console.error("Error creating request:", error);
            setFormMessage("Failed to post request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkFulfilled = async (requestId: string) => {
        if (!confirm("Are you sure you want to close this request? It will be marked as fulfilled.")) return;
        try {
            await updateDoc(doc(db, "requests", requestId), { status: 'fulfilled' });
            setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'fulfilled' } : r));
        } catch (error) {
            console.error("Error updating request:", error);
            alert("Failed to update request status.");
        }
    };

    if (loading || !user) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen p-8 pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="hero-title text-3xl">Buyer Dashboard</h1>
                    <button onClick={handleLogout} className="tw-button-ghost bg-red-900/20 text-red-400 hover:bg-red-900/40">Logout</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Request Form */}
                    <div className="lg:col-span-1">
                        <div className="tw-card sticky top-8">
                            <h2 className="section-title text-xl mb-6">New Request</h2>
                            <form onSubmit={handleCreateRequest} className="space-y-4">
                                <div>
                                    <label className="tw-label">Item Title</label>
                                    <input
                                        type="text"
                                        className="tw-input"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g. Vintage Nike Air Max"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="tw-label">Description</label>
                                    <textarea
                                        className="tw-input h-32 resize-none"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Size, color, specific details..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="tw-label">Reference Image</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                                            className="tw-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-black hover:file:bg-[var(--color-accent)]"
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={isSubmitting} className="tw-button w-full">
                                    {isSubmitting ? "Posting..." : "Post Request"}
                                </button>
                                {formMessage && (
                                    <p className={`text-sm font-bold text-center ${formMessage.includes("success") ? "text-[var(--color-primary)]" : "text-red-500"}`}>
                                        {formMessage}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Requests List */}
                    <div className="lg:col-span-2">
                        <div className="tw-card min-h-[500px]">
                            <h2 className="section-title text-xl mb-6">My Requests</h2>
                            {requests.length === 0 ? (
                                <div className="text-center text-[var(--color-subtle-text)] py-20">
                                    <p>You haven't posted any requests yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {requests.map(req => (
                                        <div key={req.id} className="bg-[var(--color-secondary)] rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden">
                                            <div className="p-4 flex gap-4">
                                                <div className="w-24 h-24 relative flex-shrink-0 bg-black rounded-lg overflow-hidden">
                                                    {req.imageBase64 && (
                                                        <Image
                                                            src={req.imageBase64}
                                                            alt={req.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-bold text-lg text-white truncate">{req.title}</h3>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${req.status === 'open' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                                                                {req.status}
                                                            </span>
                                                            {req.status === 'open' && (
                                                                <button
                                                                    onClick={() => req.id && handleMarkFulfilled(req.id)}
                                                                    className="text-[10px] text-[var(--color-subtle-text)] hover:text-white underline"
                                                                >
                                                                    Mark Fulfilled
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-[var(--color-subtle-text)] mt-1">{req.description}</p>
                                                    <div className="mt-4">
                                                        <button
                                                            onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id!)}
                                                            className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                                                        >
                                                            {expandedRequest === req.id ? "Hide Responses" : "View Responses"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Responses Section */}
                                            {expandedRequest === req.id && req.id && (
                                                <div className="border-t border-[var(--color-border)] p-4 bg-[#0a0a0a]">
                                                    <RequestResponses requestId={req.id} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
