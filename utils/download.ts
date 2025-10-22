import { BrandBible } from "../types";

/**
 * Triggers a browser download for the given data.
 * @param data The content to be downloaded (e.g., base64 string, JSON string).
 * @param filename The name of the file to be saved.
 */
export const downloadFile = (data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Downloads the entire Brand Bible as a zip file.
 * NOTE: This is a placeholder for a more complex zip implementation.
 * For now, it will download a JSON representation.
 * @param bible - The BrandBible object.
 * @param logos - The generated logos.
 * @param brandVoice - The brand voice content.
 */
export const downloadAllAssets = (bible: BrandBible, brandVoice: string | null) => {
    const data = {
        brandBible: bible,
        brandVoice: brandVoice,
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `${bible.brandName.toLowerCase().replace(/\s+/g, '-')}-brand-kit.json`);
    URL.revokeObjectURL(url);
};
