"use client"

import { makePayment } from "@/lib/ecocash";



function BuyNow({price}: {price: number}) {

    const handleOnClick = () => {
        makePayment("263774222475", price);
        console.log("Buy Now button clicked");
    }
  return (
    <div>
      <button className="buy-now-button" onClick={handleOnClick}>Buy Now</button>
    </div>
  )
}

export default BuyNow;