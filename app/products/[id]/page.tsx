

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
    const { id } = await params
    return <main className="p-8">
        <div className="flex flex-row justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Product {id}</h1>
            <button className="tw-button-ghost">💓</button>
        </div>

        <img src="https://i.pinimg.com/1200x/22/0e/16/220e1619a3d0bad2f302edaed68e0d50.jpg" alt={`Product ${id}`} className="rounded-lg bg-secondary" />

        <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-semibold">Product Name</h2>
            <p className="text-foreground/70">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p className="text-foreground/90 font-medium text-lg">$19.99</p>
            <button className="tw-button w-full">Add to Cart</button>
        </div>

    </main>
}