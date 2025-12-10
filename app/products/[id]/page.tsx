
import { getAdminDb } from "@/lib/firebase-admin";
import { Product } from "@/types/firestore";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
    const { id } = await params;

    let product: Product | null = null;

    try {
        const db = await getAdminDb();
        const docRef = db.collection("products").doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data() as any;

            // Serialize Timestamp for Client Component
            // Next.js cannot pass objects with methods (like Timestamp) to client components
            let createdAt = data.createdAt;
            if (createdAt && typeof createdAt.toDate === 'function') {
                createdAt = createdAt.toDate().toISOString(); // Convert to string
            } else if (createdAt && typeof createdAt === 'object' && '_seconds' in createdAt) {
                 // Handle case where it might be a plain object with _seconds (unlikely with admin sdk but possible)
                 createdAt = new Date(createdAt._seconds * 1000).toISOString();
            }

            product = {
                id: docSnap.id,
                ...data,
                createdAt: createdAt as any // Cast to any to satisfy Product interface temporarily
            } as Product;
        } else {
            notFound();
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        notFound();
    }

    if (!product) return notFound();

    return (
        <main className="min-h-screen p-8 pb-20 max-w-7xl mx-auto">
             <div className="flex flex-row justify-between items-center mb-6">
                 {/* Back button logic typically handled by client router, or simple link */}
                 <a href="/products" className="tw-button-ghost">← Back</a>
                 <button className="tw-button-ghost">💓</button>
            </div>

            <ProductDetailsClient product={product} />
        </main>
    );
}
