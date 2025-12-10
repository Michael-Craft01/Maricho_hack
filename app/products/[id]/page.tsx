
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
            product = { id: docSnap.id, ...data } as Product;
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
