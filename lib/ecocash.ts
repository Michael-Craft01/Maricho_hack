
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

export type PaymentResult = {
  success: boolean;
  status: number;
  message: string;
  data?: any;
};

export async function makePayment(
  customerMsisdn: string,
  amount: number,
  reason: string = "Payment",
  currency: string = "USD",
  sourceReference: string = generateUuid()
): Promise<PaymentResult> {
  try {
    const res = await fetch("https://developers.ecocash.co.zw/api/ecocash_pay/api/v2/payment/instant/c2b/sandbox", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.ECOCASH_API || "Htvgd7wD62F8fcuowSwLLXtLBRLZeqQ2",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerMsisdn: customerMsisdn,
        amount: amount,
        reason: reason,
        currency: currency,
        sourceReference: sourceReference,
      }),
    });

    // Try to parse JSON if possible, but don't fail if it's not JSON
    let data: any = null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      try {
        data = await res.json();
      } catch (e) {
        // Ignore JSON parse error
      }
    } else {
        // If not json, maybe text
        try {
            const text = await res.text();
            if (text) data = { raw: text };
        } catch (e) {
            // Ignore text parse error
        }
    }

    let message = "Unknown status";
    let success = false;

    switch (res.status) {
      case 200:
        message = "Everything worked as expected.";
        success = true;
        break;
      case 400:
        message = "Bad Request: The request was unacceptable, often due to missing a required parameter.";
        break;
      case 401:
        message = "Unauthorized: No valid API key provided.";
        break;
      case 402:
        message = "Request Failed: The parameters were valid but the request failed.";
        break;
      case 403:
        message = "Forbidden: The API key doesn’t have permissions to perform the request.";
        break;
      case 404:
        message = "Not Found: The requested resource doesn’t exist.";
        break;
      case 409:
        message = "Conflict: The request conflicts with another request.";
        break;
      case 429:
        message = "Too Many Requests: Too many requests hit the API too quickly.";
        break;
      case 500:
        message = "Server Errors: Something went wrong on Ecocash’s end.";
        break;
      default:
        message = `Unexpected status code: ${res.status}`;
    }

    // Use data message if available and status is not success, or append details
    if (data && data.message) {
        message += ` (${data.message})`;
    }

    return {
      success,
      status: res.status,
      message,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      status: 0,
      message: error.message || "Network or unexpected error occurred.",
    };
  }
}
