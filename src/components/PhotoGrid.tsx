"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { MasonryGrid } from "@egjs/grid";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Share2, Download } from "lucide-react";
import { ShareDialog } from "@/components/ShareDialog";
import { generatePhotoFilename, downloadPhotoEnhanced } from "@/utils/photo";
import { toast } from "sonner";

interface PhotoGridProps {
  photos: string[];
  columnCount: number;
  isMobile: boolean;
  onPhotoClick: (index: number) => void;
  onShare: (url: string, index: number) => void;
  onDownload: (url: string, index: number) => void;
  photoRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  selfieMatchedSet?: Set<string>;
  event?: string;
  bibNumber?: string;
}

export function PhotoGrid({
  photos,
  columnCount,
  isMobile,
  onPhotoClick,
  onShare,
  onDownload,
  photoRefs,
  selfieMatchedSet,
  event,
  bibNumber,
}: PhotoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<MasonryGrid | null>(null);
  const rafIdRef = useRef<number>(0);
  const [isGridReady, setIsGridReady] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Dynamic gap: use tighter gap on mobile when 2 columns
  const DEFAULT_GAP_PX = 6;
  const MOBILE_TWO_COLUMN_GAP_PX = 4;
  const gridGap =
    isMobile && columnCount === 2 ? MOBILE_TWO_COLUMN_GAP_PX : DEFAULT_GAP_PX;

  // Track container width
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  // Initialize MasonryGrid
  useEffect(() => {
    if (!containerRef.current || photos.length === 0) return;

    const grid = new MasonryGrid(containerRef.current, {
      gap: gridGap,
      observeChildren: true,
      useResizeObserver: true,
      column: columnCount,
      align: "justify",
    });

    gridRef.current = grid;
    setIsGridReady(true);

    return () => {
      grid.destroy();
      gridRef.current = null;
    };
  }, [columnCount, photos.length, gridGap]);

  // Re-render grid when photos change
  const scheduleRelayout = useCallback(() => {
    if (!gridRef.current) return;
    cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      const grid = gridRef.current;
      if (!grid) return;
      grid.syncElements();
      grid.renderItems();
    });
  }, []);

  useEffect(() => {
    if (isGridReady) {
      scheduleRelayout();
    }
  }, [photos, isGridReady, scheduleRelayout]);

  // Observe container resize robustly (handles fast browser resizes)
  useEffect(() => {
    if (!containerRef.current || !isGridReady) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setContainerWidth(el.offsetWidth);
      scheduleRelayout();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isGridReady, scheduleRelayout]);

  // Column width calculation for responsive images
  const columnWidth = useMemo(() => {
    if (containerWidth === 0) return 300;
    const gaps = (columnCount - 1) * gridGap;
    const padding = 0; // No additional padding needed as parent handles it
    return Math.floor((containerWidth - gaps - padding) / columnCount);
  }, [containerWidth, columnCount, gridGap]);

  const setPhotoRef = useCallback(
    (el: HTMLDivElement | null, index: number) => {
      if (el) {
        photoRefs.current.set(index, el);
      } else {
        photoRefs.current.delete(index);
      }
    },
    [photoRefs],
  );

  return (
    <div
      ref={containerRef}
      className="grid-container w-full"
      style={{
        minHeight: "100vh",
      }}
    >
      {photos.map((url, index) => (
        <div
          key={index}
          ref={(el) => setPhotoRef(el, index)}
          className="cursor-pointer"
          onClick={() => onPhotoClick(index)}
          style={{ width: `${columnWidth}px` }}
        >
          <div className="group relative overflow-hidden shadow-md transition-all duration-200 hover:shadow-2xl">
            {selfieMatchedSet?.has(url) && (
              <div className="absolute top-2 left-2 z-20">
                <Badge variant="default">
                  <span className="font-poppins text-xs">Selfie</span>
                </Badge>
              </div>
            )}
            {/* Hover Overlay - Bottom positioned */}
            <div className="absolute right-0 bottom-0 left-0 z-10 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-3 transition-all duration-300 hidden translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 md:flex items-center justify-end">
                {/* Share & Download Icons - Right Side */}
                <div className="flex items-center gap-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <ShareDialog
                      photoUrl={url}
                      filename={generatePhotoFilename(
                        event || "",
                        bibNumber,
                        index,
                      )}
                      isMobile={isMobile}
                    >
                      <button
                        className="flex h-8 w-8 items-center justify-center bg-transparent text-white hover:scale-110"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </ShareDialog>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const filename = generatePhotoFilename(
                        event || "",
                        bibNumber,
                        index,
                      );
                      const result = await downloadPhotoEnhanced(
                        url,
                        filename,
                        isMobile,
                      );

                      if (result.success) {
                        switch (result.method) {
                          case "native_share":
                            toast.success("Shared to save on device!");
                            break;
                          case "new_tab":
                            toast.info("Opened in new tab. Use browser save.");
                            break;
                          case "proxy":
                          case "direct":
                            toast.success("Photo download started!");
                            break;
                          case "newTab":
                            toast.info(
                              "Photo opened in new tab. Right-click to save.",
                            );
                            break;
                        }
                      } else {
                        toast.error("Unable to download photo.");
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center bg-transparent text-white hover:scale-110"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

            <Image
              src={url}
              alt={`Photo ${index + 1}`}
              width={columnWidth}
              height={300}
              className="h-auto w-full object-cover"
              sizes={`${columnWidth}px`}
              priority={index < columnCount}
              loading={index < columnCount ? "eager" : "lazy"}
              onLoad={scheduleRelayout}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
