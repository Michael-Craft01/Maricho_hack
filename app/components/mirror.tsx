"use client";
import React, { useState, useEffect } from "react";

interface MirrorProps {
  userPhotoFile: File;
  productPhotoFile: File;
  prompt: string; // Added prompt prop
}

export default function Mirror({ userPhotoFile, productPhotoFile, prompt }: MirrorProps) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTryOn() {
    if (!userPhotoFile || !productPhotoFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image1", userPhotoFile);
      formData.append("image2", productPhotoFile);
      // Use the prop prompt instead of the hardcoded one
      formData.append("prompt", prompt || "A photorealistic image of the person from the first image wearing the cloth from the second image.");

      // Note: Ensure your API route matches this path exactly
      const response = await fetch("/api/gen", { 
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Generation failed");

      if (data.result) {
        const finalImageSrc = `data:image/png;base64,${data.result}`;
        setGeneratedImage(finalImageSrc);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Runs whenever files or prompt changes
  useEffect(() => {
    handleTryOn();
  }, [userPhotoFile, productPhotoFile, prompt]);

  if (loading) return <div className="p-4 text-blue-500 animate-pulse">Generating Try-On...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-2 min-h-[300px] flex items-center justify-center bg-gray-50">
      {generatedImage ? (
        <img src={generatedImage} alt="Virtual Try-On Result" className="max-w-full h-auto rounded shadow-lg" />
      ) : (
        <span className="text-gray-400">Result will appear here</span>
      )}
    </div>
  );
}