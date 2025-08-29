"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { MasonryGrid } from "@egjs/grid";
import Image from "next/image";
import { Share2, Download } from "lucide-react";

interface PhotoGridProps {
  photos: string[];
  columnCount: number;
  isMobile: boolean;
  onPhotoClick: (index: number) => void;
  onShare: (url: string, index: number) => void;
  onDownload: (url: string, index: number) => void;
  photoRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
}

export function PhotoGrid({
  photos,
  columnCount,
  isMobile,
  onPhotoClick,
  onShare,
  onDownload,
  photoRefs,
}: PhotoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<MasonryGrid | null>(null);
  const [isGridReady, setIsGridReady] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

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
      gap: 6,
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
  }, [columnCount, photos.length]);

  // Re-render grid when photos change
  useEffect(() => {
    if (gridRef.current && isGridReady) {
      gridRef.current.renderItems();
    }
  }, [photos, isGridReady]);

  // Column width calculation for responsive images
  const columnWidth = useMemo(() => {
    if (containerWidth === 0) return 300;
    const gaps = (columnCount - 1) * 6;
    const padding = 0; // No additional padding needed as parent handles it
    return Math.floor((containerWidth - gaps - padding) / columnCount);
  }, [containerWidth, columnCount]);

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
          ref={(el) => {
            if (el) photoRefs.current.set(index, el);
            else photoRefs.current.delete(index);
          }}
          className="group cursor-pointer"
          onClick={() => onPhotoClick(index)}
          style={{ width: `${columnWidth}px` }}
        >
          <div className="relative overflow-hidden">
            {/* Desktop Hover Overlay */}
            {!isMobile && (
              <div className="absolute inset-0 z-10 flex items-start justify-end gap-1 bg-gradient-to-b from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void onShare(url, index);
                  }}
                  className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void onDownload(url, index);
                  }}
                  className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
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
              className="h-auto w-full object-cover transition-transform"
              sizes={`${columnWidth}px`}
              loading="lazy"
              onLoad={() => {
                // Re-render grid after image loads for proper masonry positioning
                if (gridRef.current) {
                  gridRef.current.renderItems();
                }
              }}
            />

            {/* Photo counter overlay for debugging*/}
            {/* <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-sm">
                {index + 1} / {photos.length}
              </p>
            </div> */}
          </div>
        </div>
      ))}
    </div>
  );
}
