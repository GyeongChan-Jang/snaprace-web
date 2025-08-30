/**
 * Photo-related utility functions
 */

/**
 * Extract photo ID from CloudFront URL
 * Example: https://dlzt7slmb0gog.cloudfront.net/.../HHH-4-11655.jpg -> HHH-4-11655
 */
export function extractPhotoId(url: string): string {
  const match = /\/([^/]+)\.(jpg|jpeg|png|webp)$/i.exec(url);
  if (match) {
    return match[1] ?? "";
  }
  // Fallback: use full URL hash if pattern doesn't match
  return btoa(url)
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 20);
}

/**
 * Encode photo ID for URL-safe usage
 */
export function encodePhotoId(photoId: string): string {
  return encodeURIComponent(photoId);
}

/**
 * Decode photo ID from URL
 */
export function decodePhotoId(encodedId: string): string {
  return decodeURIComponent(encodedId);
}

/**
 * Find photo index by URL in photos array
 */
export function findPhotoIndexByUrl(
  photos: string[],
  targetUrl: string,
): number {
  const targetId = extractPhotoId(targetUrl);
  return photos.findIndex((url) => extractPhotoId(url) === targetId);
}

/**
 * Find photo URL by photo ID in photos array
 */
export function findPhotoUrlById(
  photos: string[],
  photoId: string,
): string | undefined {
  const decodedId = decodePhotoId(photoId);
  return photos.find((url) => extractPhotoId(url) === decodedId);
}

/**
 * Generate shareable photo URL
 */
export function generateShareablePhotoUrl(
  photoUrl: string,
  baseUrl?: string,
): string {
  const photoId = extractPhotoId(photoUrl);
  const encodedId = encodePhotoId(photoId);
  const base =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/photo/${encodedId}`;
}

/**
 * Generate filename for photo download
 */
export function generatePhotoFilename(
  event: string,
  bibNumber?: string,
  index?: number,
): string {
  return `photo-${event}-${bibNumber ?? "all"}-${(index ?? 0) + 1}.jpg`;
}

/**
 * Handle photo sharing functionality
 */
export async function sharePhoto(
  url: string,
  index: number,
  event: string,
  isMobile: boolean,
): Promise<void> {
  if (isMobile && navigator.share) {
    try {
      await navigator.share({
        title: `Race Photo ${index + 1}`,
        text: `Check out this race photo from ${event}!`,
        url,
      });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        await copyToClipboard(url);
      }
    }
  } else {
    await copyToClipboard(url);
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    throw new Error("Failed to copy to clipboard");
  }
}

/**
 * Download photo with fallback strategies
 */
export async function downloadPhoto(
  url: string,
  filename: string,
): Promise<{ success: boolean; method: string }> {
  // Try API proxy first
  try {
    const proxyUrl = `/api/download-image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const testResponse = await fetch(proxyUrl, { method: "HEAD" });

    if (testResponse.ok) {
      const link = document.createElement("a");
      link.href = proxyUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, method: "proxy" };
    }
  } catch {
    console.log("API proxy failed, trying direct download");
  }

  // Try direct fetch
  try {
    const response = await fetch(url, { mode: "no-cors" });
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);

    return { success: true, method: "direct" };
  } catch {
    // Final fallback - open in new tab
    try {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, method: "newTab" };
    } catch {
      return { success: false, method: "failed" };
    }
  }
}

/**
 * Navigation helpers for photo grid
 */
export function getNextPhotoIndex(
  currentIndex: number,
  totalPhotos: number,
): number {
  return currentIndex < totalPhotos - 1 ? currentIndex + 1 : 0;
}

export function getPreviousPhotoIndex(
  currentIndex: number,
  totalPhotos: number,
): number {
  return currentIndex > 0 ? currentIndex - 1 : totalPhotos - 1;
}

/**
 * Scroll photo into view in the gallery
 */
export function scrollPhotoIntoView(
  photoRefs: React.MutableRefObject<Map<number, HTMLDivElement>>,
  index: number,
): void {
  const photoElement = photoRefs.current.get(index);
  if (photoElement) {
    photoElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}
