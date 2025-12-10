"use client";
import React, { useState } from "react";
import Mirror from "./mirror"; // Adjust path to where you saved Mirror.tsx

export default function TestTryOnPage() {
  // 1. Setup State for inputs
  const [prompt, setPrompt] = useState(
    "A photorealistic image of the person from the first image wearing the cloth from the second image. Keep the pose and lighting consistent."
  );
  const [userFile, setUserFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  
  // State to control when to render the Mirror component
  const [isReady, setIsReady] = useState(false);

  // Helper to handle file selection
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
      setIsReady(false); // Reset readiness so it doesn't auto-fire while changing files
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">🛍️ Maricho: Virtual Mirror Test</h1>

        {/* Input Field 1: Prompt */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Generation Prompt
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-black"
            rows={3}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setIsReady(false); // Reset if prompt changes
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Input Field 2: Person Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              👤 User Photo (Person)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setUserFile)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {userFile && <p className="mt-1 text-xs text-green-600">Selected: {userFile.name}</p>}
          </div>

          {/* Input Field 3: Clothing Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              👕 Product Photo (Clothing)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setProductFile)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100"
            />
             {productFile && <p className="mt-1 text-xs text-green-600">Selected: {productFile.name}</p>}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsReady(true)}
          disabled={!userFile || !productFile}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all
            ${(!userFile || !productFile) 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-black hover:bg-gray-800 shadow-lg"
            }`}
        >
          ✨ Generate Virtual Try-On
        </button>

        {/* Render Mirror Component conditionally */}
        {isReady && userFile && productFile && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Result:</h2>
            <Mirror 
              userPhotoFile={userFile} 
              productPhotoFile={productFile} 
              prompt={prompt} 
            />
          </div>
        )}

      </div>
    </div>
  );
}