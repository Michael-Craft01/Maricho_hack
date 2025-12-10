"use client";

import { useState } from "react";
import { makePayment, PaymentResult } from "@/lib/ecocash";

function BuyNow({ price }: { price: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setResult(null);
    setPhoneNumber("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePayment = async () => {
    if (!phoneNumber) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await makePayment(phoneNumber, price);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        status: 0,
        message: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="tw-button w-full text-lg shadow-[0_0_20px_rgba(255,214,10,0.4)]"
        onClick={handleOpenModal}
      >
        Buy Now
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="tw-card w-full max-w-md bg-[var(--color-card)] relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-[var(--color-subtle-text)] hover:text-white"
            >
              <span className="material-symbols-rounded text-2xl">close</span>
            </button>

            <h2 className="text-2xl font-bold mb-2 text-white">EcoCash Payment</h2>
            <p className="text-[var(--color-subtle-text)] mb-6">
              Enter your EcoCash number to pay <span className="text-[var(--color-primary)] font-bold">${price}</span>
            </p>

            {!result?.success ? (
              <div className="space-y-4">
                <div>
                  <label className="tw-label">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="077xxxxxxx"
                    className="tw-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {result && !result.success && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {result.message}
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading || !phoneNumber}
                  className="tw-button w-full flex items-center gap-2 justify-center"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-rounded text-green-500 text-3xl">check</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Payment Initiated!</h3>
                  <p className="text-[var(--color-subtle-text)]">
                    Check your phone to complete the transaction.
                  </p>
                </div>
                 <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                    {result.message}
                  </div>
                <button
                  onClick={handleCloseModal}
                  className="tw-button-secondary w-full mt-4"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default BuyNow;
