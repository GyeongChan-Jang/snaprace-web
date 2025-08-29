/**
 * Photo-related event handlers hook
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { sharePhoto, downloadPhoto, scrollPhotoIntoView } from "@/utils/photo";

interface UsePhotoHandlersProps {
  event: string;
  bibParam: string;
  isMobile: boolean;
  photoRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  setClickedPhotoRect: (rect: DOMRect | null) => void;
}

export function usePhotoHandlers({
  event,
  bibParam,
  isMobile,
  photoRefs,
  setClickedPhotoRect,
}: UsePhotoHandlersProps) {
  const router = useRouter();

  // Handle photo click to open SingleView
  const handlePhotoClick = useCallback(
    (index: number) => {
      const photoElement = photoRefs.current.get(index);
      if (photoElement) {
        setClickedPhotoRect(photoElement.getBoundingClientRect());
      }

      // Update URL with photo index only
      const newParams = new URLSearchParams();
      newParams.set("idx", index.toString());
      router.push(`/events/${event}/${bibParam}?${newParams.toString()}`, {
        scroll: false,
      });
    },
    [event, bibParam, router, photoRefs, setClickedPhotoRect],
  );

  // Handle photo index change in SingleView
  const handlePhotoIndexChange = useCallback(
    (newIndex: number) => {
      // Real-time scroll synchronization with background gallery
      scrollPhotoIntoView(photoRefs, newIndex);

      // Update URL with new index only (no scroll parameter)
      const newParams = new URLSearchParams();
      newParams.set("idx", newIndex.toString());
      router.push(`/events/${event}/${bibParam}?${newParams.toString()}`, {
        scroll: false,
      });
    },
    [event, bibParam, router, photoRefs],
  );

  // Handle closing SingleView
  const handleCloseSingleView = useCallback(() => {
    router.push(`/events/${event}/${bibParam}`, { scroll: false });
  }, [event, bibParam, router]);

  // Handle photo sharing
  const handleShare = useCallback(
    async (photoUrl: string, index?: number) => {
      try {
        await sharePhoto(photoUrl, index ?? 0, event, isMobile);
        toast.success("Photo shared successfully!");
      } catch {
        toast.error("Failed to share photo");
      }
    },
    [event, isMobile],
  );

  // Handle photo download
  const handleDownload = useCallback(async (photoUrl: string, index?: number) => {
    const filename = `photo-${event}-${index ? index + 1 : "unknown"}.jpg`;
    
    const result = await downloadPhoto(photoUrl, filename);
    
    if (result.success) {
      switch (result.method) {
        case "proxy":
        case "direct":
          toast.success("Photo download started!");
          break;
        case "newTab":
          toast.info("Photo opened in new tab. Right-click to save.");
          break;
      }
    } else {
      toast.error("Unable to download photo.");
    }
  }, [event]);

  return {
    handlePhotoClick,
    handlePhotoIndexChange,
    handleCloseSingleView,
    handleShare,
    handleDownload,
  };
}