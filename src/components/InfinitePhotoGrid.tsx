"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { MasonryGrid } from "@egjs/grid";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Share2, Download } from "lucide-react";

interface InfinitePhotoGridProps {
  photos: string[];
  columnCount: number;
  isMobile: boolean;
  onPhotoClick: (index: number) => void;
  onShare: (url: string, index: number) => void;
  onDownload: (url: string, index: number) => void;
  photoRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  selfieMatchedSet?: Set<string>;
}

export function InfinitePhotoGrid({
  photos,
  columnCount,
  isMobile,
  onPhotoClick,
  onShare,
  onDownload,
  photoRefs,
  selfieMatchedSet,
}: InfinitePhotoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<MasonryGrid | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number>(0);

  const [isGridReady, setIsGridReady] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Magic numbers named for clarity
  const DEFAULT_GAP_PX = 6;
  const MOBILE_TWO_COLUMN_GAP_PX = 4;
  const gridGap =
    isMobile && columnCount === 2 ? MOBILE_TWO_COLUMN_GAP_PX : DEFAULT_GAP_PX;

  // Tune batch sizes
  const MIN_INITIAL_BATCH = 40;
  const PER_COLUMN_INITIAL_ROWS = 12; // rows per column initially
  const LOAD_MORE_BATCH = 60;

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

  // Initialize MasonryGrid once per layout changes
  useEffect(() => {
    if (!containerRef.current) return;

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
  }, [columnCount, gridGap]);

  // Debounced relayout helper for fast UI changes
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

  // Re-render grid when items change
  useEffect(() => {
    if (!isGridReady) return;
    scheduleRelayout();
  }, [visibleCount, isGridReady, photos, scheduleRelayout]);

  // Observe container size for rapid resizes
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

  // Compute column width
  const columnWidth = useMemo(() => {
    if (containerWidth === 0) return 300;
    const gaps = (columnCount - 1) * gridGap;
    const padding = 0;
    return Math.floor((containerWidth - gaps - padding) / columnCount);
  }, [containerWidth, columnCount, gridGap]);

  // Reset visible count when photos or layout changes
  useEffect(() => {
    const initialByColumns = columnCount * PER_COLUMN_INITIAL_ROWS;
    const initial = Math.max(MIN_INITIAL_BATCH, initialByColumns);
    setVisibleCount(Math.min(initial, photos.length));
  }, [photos.length, columnCount]);

  // IntersectionObserver to load more
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          setVisibleCount((prev) => {
            const next = Math.min(prev + LOAD_MORE_BATCH, photos.length);
            return next;
          });
          // allow subsequent loads in next tick
          setTimeout(() => setIsLoadingMore(false), 0);
        }
      },
      { root: null, rootMargin: "400px 0px", threshold: 0 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [photos.length, isLoadingMore]);

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

  // Render only visible photos, but keep global index
  const items = useMemo(() => {
    return photos.slice(0, visibleCount).map((url, i) => ({ url, index: i }));
  }, [photos, visibleCount]);

  return (
    <>
      <div
        ref={containerRef}
        className="grid-container w-full"
        style={{ minHeight: "100vh" }}
      >
        {items.map(({ url, index }) => (
          <div
            key={index}
            ref={(el) => setPhotoRef(el, index)}
            className="cursor-pointer"
            onClick={() => onPhotoClick(index)}
            style={{ width: `${columnWidth}px` }}
          >
            <div className="relative overflow-hidden">
              {selfieMatchedSet?.has(url) && (
                <div className="absolute top-1 left-1 z-20">
                  <Badge variant="selfie">Selfie match</Badge>
                </div>
              )}
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
                  // After image natural size is known, reflow the grid
                  scheduleRelayout();
                }}
              />

              {/* for debugging */}
              {/* <div className="text-center text-xs text-gray-500">
                {index + 1} / {photos.length}
              </div> */}
            </div>
          </div>
        ))}
      </div>
      {/* Sentinel */}
      <div ref={sentinelRef} className="h-6" />
    </>
  );
}
