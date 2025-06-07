// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function blobToBase64(blob: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve((reader.result as string).split(",").slice(1).join(","));
    reader.onerror = reject;
  });
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function base64ToBlob(base64: any, mimeType: string) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length)
    .fill(0)
    .map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
