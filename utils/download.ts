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
