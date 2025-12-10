
/**
 * Generate a RFC-4122 v4 UUID.
 * Uses crypto.randomUUID() when available, otherwise falls back to a secure implementation.
 */
export function generateUuid(): string {
  // Prefer built-in crypto.randomUUID()
  if (typeof (globalThis as any).crypto?.randomUUID === "function") {
    return (globalThis as any).crypto.randomUUID();
  }

  // Fallback: RFC-4122 version 4 using crypto.getRandomValues
  // Implementation adapted for browsers
  const buf = new Uint8Array(16);
  (globalThis as any).crypto.getRandomValues(buf);

  // Per RFC: set version bits (4) and variant bits (10xx)
  buf[6] = (buf[6] & 0x0f) | 0x40; // version 4
  buf[8] = (buf[8] & 0x3f) | 0x80; // variant 10xx

  const toHex = (n: number) => n.toString(16).padStart(2, "0");

  const parts = [
    Array.from(buf.slice(0, 4)).map(toHex).join(""),
    Array.from(buf.slice(4, 6)).map(toHex).join(""),
    Array.from(buf.slice(6, 8)).map(toHex).join(""),
    Array.from(buf.slice(8, 10)).map(toHex).join(""),
    Array.from(buf.slice(10, 16)).map(toHex).join(""),
  ];

  return `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}-${parts[4]}`;
}

export async function makePayment(customerMsisdn: string, amount: number, reason: string = "Payment", currency: string = "USD", sourceReference: string = generateUuid()) {
    let res = await fetch("https://developers.ecocash.co.zw/api/ecocash_pay/api/v2/payment/instant/c2b/sandbox", {
        method: "POST",
        headers: {
            "X-API-KEY": process.env.ECOCASH_API || "Htvgd7wD62F8fcuowSwLLXtLBRLZeqQ2",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            customerMsisdn: customerMsisdn,
            amount: amount,
            reason: reason,
            currency: currency,
            sourceReference: sourceReference
        })
    })
    alert("Payment initiated! Please check your phone.");
    //return res.json();
}