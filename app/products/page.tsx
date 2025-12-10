
const fakeItems = [
    {
        imageSrc: "https://i.pinimg.com/736x/de/2d/02/de2d021e61235ccfcd81fa355f6790fc.jpg",
        name: "Product 1",
        price: "$10.00"
    },
    {
        imageSrc: "https://i.pinimg.com/1200x/22/0e/16/220e1619a3d0bad2f302edaed68e0d50.jpg",
        name: "Product 2",
        price: "$20.00"
    }
]

export default function ProductsList() {
    return <main className="p-8">
        <h1 className="text-3xl font-bold mb-6">Maricho</h1>

        <form className="mb-2">
            <input type="search" name="search" id="search" className="tw-input" placeholder="Search" />
        </form>


        <ul className="grid grid-cols-2 mt-2 gap-6">
            {fakeItems.map((item, index) => (
                <ProductItem key={index} imageSrc={item.imageSrc} name={item.name} price={item.price} />
            ))}
        </ul>

    </main>
}



function ProductItem({imageSrc, name, price}: {imageSrc: string; name: string; price: string}) {
    return <li className="text-center">
        <img className="rounded-lg bg-secondary" src={imageSrc} alt={name} />
        <h2 className="mt-2 font-semibold">{name}</h2>
        <p className="text-foreground/50">{price}</p>
    </li>
}