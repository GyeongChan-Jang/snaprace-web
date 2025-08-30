"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { MasonryGrid } from "@egjs/grid";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Share2, Download } from "lucide-react";

interface PhotoGridProps {
  photos: string[];
  columnCount: number;
  isMobile: boolean;
  onPhotoClick: (index: number) => void;
  onShare: (url: string, index: number) => void;
  onDownload: (url: string, index: number) => void;
  photoRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  selfieMatchedSet?: Set<string>;
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
}: PhotoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<MasonryGrid | null>(null);
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
  useEffect(() => {
    if (gridRef.current && isGridReady) {
      gridRef.current.renderItems();
    }
  }, [photos, isGridReady]);

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
          <div className="relative overflow-hidden">
            {selfieMatchedSet?.has(url) && (
              <div className="absolute top-1 left-1">
                <Badge variant="default">
                  <span className="font-poppins text-xs">Selfie</span>
                </Badge>
              </div>
            )}
            {/* Desktop Hover Overlay */}
            {!isMobile && (
              <div className="absolute inset-0 z-10 hidden items-start justify-end gap-1 p-2 opacity-0 transition-opacity hover:opacity-100 md:flex">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(url, index);
                  }}
                  className="rounded-full bg-black/30 p-2 text-white backdrop-blur-sm hover:bg-black/40"
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(url, index);
                  }}
                  className="rounded-full bg-black/30 p-2 text-white backdrop-blur-sm hover:bg-black/40"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            )}

            <Image
              src={url}
              alt={`Photo ${index + 1}`}
              width={columnWidth}
              height={300}
              className="h-auto w-full object-cover"
              sizes={`${columnWidth}px`}
              priority={index < columnCount}
              loading={index < columnCount ? "eager" : "lazy"}
              onLoad={() => {
                // Re-render grid after image loads for proper masonry positioning
                if (gridRef.current) {
                  gridRef.current.renderItems();
                }
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
