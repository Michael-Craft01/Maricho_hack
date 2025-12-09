import BuyNow from "./buy-now";


export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">Welcome to the Marketplace</h1>
      <BuyNow price={50} />
    </div>
  );
}