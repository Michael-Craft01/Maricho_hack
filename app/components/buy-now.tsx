"use client"

function BuyNow({price}: {price: number}) {

    const handleOnClick = () => {
        // Handle the buy now action here
        console.log("Buy Now button clicked");
    }
  return (
    <div>
      <button className="buy-now-button" onClick={handleOnClick}>Buy Now</button>
    </div>
  )
}

export default BuyNow;