import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File> => {
    const options = {
        maxSizeMB: 0.2, // 200KB
        maxWidthOrHeight: 1280,
        useWebWorker: true,
    };
    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error("Image compression failed:", error);
        throw error;
    }
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = "di21cbkyf";
    // Note: ensure you have an Unsigned Upload Preset named 'ml_default' in Cloudinary Settings > Upload
    const uploadPreset = "ml_default";

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    // formData.append('cloud_name', cloudName); // Not strictly needed in body if in URL, but harmless

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("Cloudinary error:", errData);
            throw new Error(errData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Cloudinary upload failed (check Upload Preset 'ml_default' in Cloudinary console), falling back to local preview:", error);
        // Fallback to base64 to keep the app working for the user even if they haven't configured the preset
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
        });
    }
};
