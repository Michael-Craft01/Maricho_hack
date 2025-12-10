"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types/firestore";
import Link from "next/link";
import Image from "next/image";

export default function ProductsList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch all products
                // Ideally we should paginate or limit, but for now we fetch all
                const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const items: Product[] = [];
                querySnapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() } as Product);
                });
                setProducts(items);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-8 text-center text-[var(--color-subtle-text)]">Loading market...</div>;
    }

    return (
        <main className="p-6 pb-20 max-w-7xl mx-auto">
            <h1 className="hero-title mb-8 text-[var(--color-primary)]">Maricho</h1>

            <form className="mb-8" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                    <input
                        type="search"
                        className="tw-input pl-12"
                        placeholder="Search sneakers, gear..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-subtle-text)]">
                        🔍
                    </span>
                </div>
            </form>

            {filteredProducts.length === 0 ? (
                <div className="text-center text-[var(--color-subtle-text)] py-12">
                    <p>No products found.</p>
                </div>
            ) : (
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductItem key={product.id} product={product} />
                    ))}
                </ul>
            )}
        </main>
    );
}

function ProductItem({ product }: { product: Product }) {
    return (
        <li className="tw-card-product group hover:scale-[1.02] transition-transform duration-300">
            <Link href={`/products/${product.id}`} className="block h-full">
                <div className="image-container aspect-square w-full">
                    {/* The yellow blob background effect */}
                    <div className="blob-bg w-[80%] h-[80%] top-[10%] left-[10%]"></div>

                    <div className="relative w-full h-full drop-shadow-2xl z-10">
                         {product.imageBase64 ? (
                            <Image
                                src={product.imageBase64}
                                alt={product.name}
                                fill
                                className="object-contain p-4"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                        )}
                    </div>
                </div>

                <div className="p-4 flex flex-col gap-1">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white truncate">{product.name}</h2>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[var(--color-subtle-text)] text-xs">{product.category}</span>
                        <span className="text-[var(--color-primary)] font-mono font-bold">${product.price}</span>
                    </div>
                </div>
            </Link>
        </li>
    );
}
