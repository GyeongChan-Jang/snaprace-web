/**
 * Photo state management hook for URL and modal states
 */

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { calculateColumnCount, isMobileDevice, debounce } from "@/utils/device";

export function usePhotoState() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // URL parameters
  const event = params?.event as string;
  const bibParam = params?.bib as string;
  const isAllPhotos = bibParam === "null";
  const bibNumber = isAllPhotos ? "" : bibParam;

  // Local states
  const [searchBib, setSearchBib] = useState(bibNumber || "");
  const [columnCount, setColumnCount] = useState(4);
  const [isMobile, setIsMobile] = useState(false);
  const [clickedPhotoRect, setClickedPhotoRect] = useState<DOMRect | null>(null);

  // Parse SingleView state from URL
  const photoIndex = searchParams.get("idx");
  const isModalOpen = photoIndex !== null;
  const currentPhotoIndex = photoIndex ? parseInt(photoIndex, 10) : 0;

  // Responsive layout effect
  useEffect(() => {
    const updateLayout = debounce(() => {
      const width = window.innerWidth;
      setColumnCount(calculateColumnCount(width));
      setIsMobile(isMobileDevice());
    }, 100);

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  return {
    // URL params
    event,
    bibParam,
    bibNumber,
    isAllPhotos,
    
    // Search state
    searchBib,
    setSearchBib,
    
    // Layout state
    columnCount,
    isMobile,
    
    // Modal state
    isModalOpen,
    currentPhotoIndex,
    clickedPhotoRect,
    setClickedPhotoRect,
  };
}