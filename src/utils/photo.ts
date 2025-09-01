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
 * Supports optional organizer/event/bib query params.
 */
export function generateShareablePhotoUrl(
  photoUrl: string,
  optionsOrBase?:
    | string
    | {
        baseUrl?: string;
        organizerId?: string;
        eventId?: string;
        bibNumber?: string;
      },
  legacyBaseUrl?: string,
): string {
  const photoId = extractPhotoId(photoUrl);
  const encodedId = encodePhotoId(photoId);

  // Backward-compatible parameter handling
  const options =
    typeof optionsOrBase === "string"
      ? { baseUrl: optionsOrBase }
      : (optionsOrBase as
          | {
              baseUrl?: string;
              organizerId?: string;
              eventId?: string;
              bibNumber?: string;
            }
          | undefined);

  const base =
    options?.baseUrl ||
    legacyBaseUrl ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const url = new URL(`${base}/photo/${encodedId}`, base || "http://localhost");
  const orgId = options?.organizerId ?? undefined;
  const evtId = options?.eventId ?? undefined;
  const bib = options?.bibNumber ?? undefined;
  if (orgId) url.searchParams.set("organizerId", orgId);
  if (evtId) url.searchParams.set("eventId", evtId);
  if (bib) url.searchParams.set("bibNumber", bib);

  // For server-side without a real base, return path with query string
  if (!base) {
    const qs = url.search.toString();
    return `/photo/${encodedId}${qs ? `?${qs}` : ""}`;
  }
  return url.toString();
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
 * Bulk download multiple photos as ZIP file
 * Downloads as individual files if less than 10, or as ZIP if 10 or more
 */
export async function bulkDownloadPhotos(
  urls: string[],
  eventName: string,
  bibNumber?: string,
): Promise<{ success: boolean; method: string; count: number }> {
  const photoCount = urls.length;

  // If less than 10 photos, download individually
  if (photoCount < 10) {
    let successCount = 0;
    for (let i = 0; i < urls.length; i++) {
      const filename = generatePhotoFilename(
        eventName,
        bibNumber || undefined,
        i,
      );
      const result = await downloadPhoto(urls[i]!, filename);
      if (result.success) successCount++;
      // Add small delay between downloads to avoid overwhelming the browser
      if (i < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    return {
      success: successCount > 0,
      method: "individual",
      count: successCount,
    };
  }

  // For 10+ photos, create and download as ZIP
  try {
    // Dynamic import to reduce initial bundle size
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    // Create a folder in the ZIP
    const folderName = `${eventName}${bibNumber ? `-${bibNumber}` : ""}-photos`;
    const folder = zip.folder(folderName);

    if (!folder) {
      throw new Error("Failed to create ZIP folder");
    }

    // Download all images and add to ZIP
    const downloadPromises = urls.map(async (url, index) => {
      try {
        // Try to fetch the image
        const response = await fetch(url, { mode: "cors" });
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);

        const blob = await response.blob();
        const filename = generatePhotoFilename(
          eventName,
          bibNumber || undefined,
          index,
        );

        // Add to ZIP folder
        folder.file(filename, blob);
        return true;
      } catch (error) {
        console.error(`Failed to download image ${index + 1}:`, error);
        // Try with proxy as fallback
        try {
          const proxyUrl = `/api/download-image?url=${encodeURIComponent(url)}`;
          const proxyResponse = await fetch(proxyUrl);
          if (proxyResponse.ok) {
            const blob = await proxyResponse.blob();
            const filename = generatePhotoFilename(
              eventName,
              bibNumber || undefined,
              index,
            );
            folder.file(filename, blob);
            return true;
          }
        } catch {
          // Skip this image if both methods fail
        }
        return false;
      }
    });

    const results = await Promise.all(downloadPromises);
    const successCount = results.filter((r) => r).length;

    if (successCount === 0) {
      throw new Error("No images could be downloaded");
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }, // Balanced compression
    });

    // Create download link
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${folderName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return {
      success: true,
      method: "zip",
      count: successCount,
    };
  } catch (error) {
    console.error("Bulk download failed:", error);

    // Fallback to individual downloads
    let successCount = 0;
    for (let i = 0; i < Math.min(urls.length, 5); i++) {
      const filename = generatePhotoFilename(
        eventName,
        bibNumber || undefined,
        i,
      );
      const result = await downloadPhoto(urls[i]!, filename);
      if (result.success) successCount++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return {
      success: successCount > 0,
      method: "fallback_individual",
      count: successCount,
    };
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

/**
 * Enhanced photo share functionality with multiple options
 */
export async function sharePhotoWithOptions(
  photoUrl: string,
  shareableUrl: string,
  filename: string,
  isMobile = false,
): Promise<{ success: boolean; method: string }> {
  const isMobileDevice = isMobile || /Mobi|Android/i.test(navigator.userAgent);

  // On mobile, try native share with file first
  if (isMobileDevice && navigator.share) {
    try {
      // Try to share with file for better UX
      const response = await fetch(photoUrl, { mode: "cors" });
      const blob = await response.blob();
      const fileToShare = new File([blob], filename, {
        type: blob.type || "image/jpeg",
      });

      const dataWithFiles = {
        files: [fileToShare],
        title: "SnapRace Photo",
        text: "Check out this race photo!",
      } as unknown as ShareData;

      if (navigator.canShare?.(dataWithFiles)) {
        await navigator.share({
          files: [fileToShare],
          title: "SnapRace Photo",
          text: "Check out this race photo!",
        });
        return { success: true, method: "native_file" };
      }
    } catch {
      // Fall through to URL sharing
    }

    // Fallback to URL sharing
    try {
      await navigator.share({
        title: "SnapRace Photo",
        text: "Check out this race photo!",
        url: shareableUrl,
      });
      return { success: true, method: "native_url" };
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return { success: false, method: "cancelled" };
      }
      // Fall through to clipboard copy
    }
  }

  // Fallback: copy shareable URL to clipboard
  try {
    await navigator.clipboard.writeText(shareableUrl);
    return { success: true, method: "clipboard" };
  } catch {
    return { success: false, method: "failed" };
  }
}

/**
 * Enhanced photo download functionality
 */
export async function downloadPhotoEnhanced(
  photoUrl: string,
  filename: string,
  isMobile = false,
): Promise<{ success: boolean; method: string }> {
  const isMobileDevice = isMobile || /Mobi|Android/i.test(navigator.userAgent);

  // On mobile, use native share with file to allow saving to device
  if (isMobileDevice && navigator.share) {
    try {
      const response = await fetch(photoUrl, { mode: "cors" });
      const blob = await response.blob();
      const fileToShare = new File([blob], filename, {
        type: blob.type || "image/jpeg",
      });

      const dataWithFiles = {
        files: [fileToShare],
        title: filename,
      } as unknown as ShareData;

      if (navigator.canShare?.(dataWithFiles)) {
        await navigator.share({
          files: [fileToShare],
          title: filename,
        });
        return { success: true, method: "native_share" };
      }
    } catch {
      // Fall through to next method
    }

    // Fallback: open in new tab for mobile save
    try {
      window.open(photoUrl, "_blank", "noopener,noreferrer");
      return { success: true, method: "new_tab" };
    } catch {
      return { success: false, method: "failed" };
    }
  }

  // Desktop: use existing download logic
  return await downloadPhoto(photoUrl, filename);
}
