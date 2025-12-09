"ue client";
import React, { useState } from "react";


export default function Mirror({ userPhotoFile, productPhotoFile }: { userPhotoFile: File, productPhotoFile: File }) {

    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    async function handleTryOn() {
        const formData = new FormData();
        formData.append("image1", userPhotoFile);     // The user's photo
        formData.append("image2", productPhotoFile);  // The product image
        formData.append("prompt", "A photorealistic image of the person from the first image wearing the cloth from the second image. Keep the pose and lighting consistent.");

        const response = await fetch("/api/gen/", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (data.result) {
            // Render the image directly
            const finalImageSrc = `data:image/png;base64,${data.result}`;
            setGeneratedImage(finalImageSrc);
        }
    }

    React.useEffect(() => {
        handleTryOn();
    }, [userPhotoFile, productPhotoFile]);
    
    return <div>
        <img src={generatedImage || ""} alt="" />
    </div>;
}