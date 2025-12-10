"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { fileToBase64 } from "@/lib/utils";
import { Product } from "@/types/firestore";
import Image from "next/image";

export default function SellerDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);

    // Form State
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Sneakers"); // Default
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState("");

    // Fetch products
    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login");
        } else if (user) {
            fetchSellerProducts(user.uid);
        }
    }, [user, loading, router]);

    const fetchSellerProducts = async (uid: string) => {
        try {
            const q = query(collection(db, "products"), where("sellerId", "==", uid));
            const querySnapshot = await getDocs(q);
            const items: Product[] = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as Product);
            });
            setProducts(items);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
    };

    const handleAddProduct = async (e: React.FormEvent) => {
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

            const newProduct: Product = {
                sellerId: user.uid,
                name,
                description,
                price: parseFloat(price),
                category,
                imageBase64: base64,
                createdAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, "products"), newProduct);

            // Add to local state to avoid refetch
            setProducts([...products, { id: docRef.id, ...newProduct }]);

            // Reset form
            setName("");
            setPrice("");
            setDescription("");
            setImageFile(null);
            setFormMessage("Product added successfully!");
        } catch (error) {
            console.error("Error adding product:", error);
            setFormMessage("Failed to add product.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteDoc(doc(db, "products", productId));
            setProducts(products.filter(p => p.id !== productId));
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    if (loading || !user) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen p-8 pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="hero-title text-3xl">Seller Dashboard</h1>
                    <div className="flex gap-4">
                        <button onClick={() => router.push("/seller-dashboard/market")} className="tw-button">Market Pulse</button>
                        <button onClick={() => router.push("/profile")} className="tw-button-secondary">Profile</button>
                        <button onClick={handleLogout} className="tw-button-ghost bg-red-900/20 text-red-400 hover:bg-red-900/40">Logout</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Product Form */}
                    <div className="lg:col-span-1">
                        <div className="tw-card sticky top-8">
                            <h2 className="section-title text-xl mb-6">Add New Product</h2>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <div>
                                    <label className="tw-label">Product Name</label>
                                    <input
                                        type="text"
                                        className="tw-input"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="tw-label">Price ($)</label>
                                    <input
                                        type="number"
                                        className="tw-input"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        required
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="tw-label">Category</label>
                                    <select
                                        className="tw-select w-full"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                    >
                                        <option value="Sneakers">Sneakers</option>
                                        <option value="Apparel">Apparel</option>
                                        <option value="Accessories">Accessories</option>
                                        <option value="Collectibles">Collectibles</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="tw-label">Description</label>
                                    <textarea
                                        className="tw-input h-32 resize-none"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="tw-label">Product Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                                        className="tw-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-black hover:file:bg-[var(--color-accent)]"
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={isSubmitting} className="tw-button w-full">
                                    {isSubmitting ? "Adding..." : "Add Product"}
                                </button>
                                {formMessage && (
                                    <p className={`text-sm font-bold text-center ${formMessage.includes("success") ? "text-[var(--color-primary)]" : "text-red-500"}`}>
                                        {formMessage}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Inventory List */}
                    <div className="lg:col-span-2">
                         <div className="tw-card min-h-[500px]">
                            <h2 className="section-title text-xl mb-6">My Inventory</h2>
                            {products.length === 0 ? (
                                <div className="text-center text-[var(--color-subtle-text)] py-20">
                                    <p>No products yet. Add your first item!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {products.map(product => (
                                        <div key={product.id} className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--color-secondary)] border border-[var(--color-border)]">
                                            <div className="w-20 h-20 relative flex-shrink-0 bg-black rounded-lg overflow-hidden">
                                                {product.imageBase64 ? (
                                                     <Image
                                                        src={product.imageBase64}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                     />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Img</div>
                                                )}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h3 className="font-bold truncate text-white">{product.name}</h3>
                                                <p className="text-sm text-[var(--color-subtle-text)] truncate">{product.description}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="tw-tag">{product.category}</span>
                                                    <span className="text-[var(--color-primary)] font-mono font-bold">${product.price}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => product.id && handleDeleteProduct(product.id)}
                                                className="tw-button-secondary text-xs px-4 py-2 border-red-900/50 text-red-500 hover:bg-red-900/20 hover:border-red-900"
                                            >
                                                Delete
                                            </button>
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
