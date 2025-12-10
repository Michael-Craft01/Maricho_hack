
import { getAdminDb } from "@/lib/firebase-admin";
import { Product } from "@/types/firestore";
import Image from "next/image";
import { notFound } from "next/navigation";

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
            // Firestore Admin SDK returns Timestamp objects that might need serialization for client components if passed down
            // But here we are rendering in Server Component, so it's fine.
            // We cast data to any first because Admin SDK types might differ slightly from our interface (Timestamp versions)
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
                 {/* Back button or Breadcrumb could go here */}
                 <div className="flex items-center gap-2">
                    <span className="tw-tag">{product.category}</span>
                 </div>
                 <button className="tw-button-ghost">💓</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Section */}
                <div className="tw-card-product p-8 flex items-center justify-center min-h-[400px] lg:min-h-[600px] relative">
                    <div className="blob-bg w-full h-full opacity-20"></div>
                    <div className="relative w-full h-full">
                         {product.imageBase64 ? (
                            <Image
                                src={product.imageBase64}
                                alt={product.name}
                                fill
                                className="object-contain drop-shadow-2xl"
                                priority
                            />
                        ) : (
                             <div className="flex items-center justify-center w-full h-full text-gray-500">
                                No Image Available
                             </div>
                        )}
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center space-y-8">
                    <div>
                        <h1 className="hero-title text-4xl lg:text-5xl mb-4 text-white uppercase">{product.name}</h1>
                        <p className="text-[var(--color-primary)] font-mono text-3xl font-bold">${product.price}</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="tw-label text-sm">Description</h2>
                        <p className="text-[var(--color-foreground)] opacity-80 leading-relaxed text-lg">
                            {product.description}
                        </p>
                    </div>

                    <div className="pt-8">
                        <button className="tw-button w-full text-lg">
                            Add to Cart
                        </button>
                    </div>

                    <div className="pt-4 border-t border-[var(--color-border)]">
                         <div className="flex items-center gap-2 text-sm text-[var(--color-subtle-text)]">
                            <span>Sold by:</span>
                            {/* In a real app we would fetch the seller name using product.sellerId */}
                            <span className="text-white font-semibold">Seller ID: {product.sellerId.substring(0, 6)}...</span>
                         </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
