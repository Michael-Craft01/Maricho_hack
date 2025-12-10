"use client"

import { makePayment } from "@/lib/ecocash";

function BuyNow({price}: {price: number}) {
    const handleOnClick = () => {
        makePayment((window.prompt("Enter your phone number here. ") || "263785733582").toString(), price);
        console.log("Buy Now button clicked");
    }
  return (
      <button className="tw-button w-full text-lg shadow-[0_0_20px_rgba(255,214,10,0.4)]" onClick={handleOnClick}>Buy Now</button>
  )
}

export default BuyNow;