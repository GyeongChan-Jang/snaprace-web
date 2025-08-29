"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PhotoSingleViewProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  event?: string;
  bibNumber?: string;
  originRect?: DOMRect | null;
  onPhotoChange?: (index: number) => void;
}

export function PhotoSingleView({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onIndexChange,
  event,
  bibNumber,
  originRect,
  onPhotoChange,
}: PhotoSingleViewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sequential navigation (row-based: 1→2→3→4→5...)
  const handlePrevious = useCallback(() => {
    const totalPhotos = photos.length;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : totalPhotos - 1;
    onIndexChange(newIndex);
    onPhotoChange?.(newIndex);
  }, [currentIndex, photos.length, onIndexChange, onPhotoChange]);

  const handleNext = useCallback(() => {
    const totalPhotos = photos.length;
    const newIndex = currentIndex < totalPhotos - 1 ? currentIndex + 1 : 0;
    onIndexChange(newIndex);
    onPhotoChange?.(newIndex);
  }, [currentIndex, photos.length, onIndexChange, onPhotoChange]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") handlePrevious();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") handleNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrevious, handleNext]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Animation effect
  useEffect(() => {
    if (isOpen && originRect && imageRef.current) {
      setIsAnimating(true);

      // Start position (gallery photo position)
      const startX = originRect.left + originRect.width / 2;
      const startY = originRect.top + originRect.height / 2;

      // End position (center of viewport)
      const endX = window.innerWidth / 2;
      const endY = window.innerHeight / 2;

      // Calculate scale
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.9;
      const scale = Math.min(
        maxWidth / originRect.width,
        maxHeight / originRect.height,
        3,
      );

      // Apply initial transform
      imageRef.current.style.transform = `translate(${startX - endX}px, ${startY - endY}px) scale(${1 / scale})`;
      imageRef.current.style.opacity = "0";

      // Trigger animation
      requestAnimationFrame(() => {
        if (imageRef.current) {
          imageRef.current.style.transition =
            "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease";
          imageRef.current.style.transform = "translate(0, 0) scale(1)";
          imageRef.current.style.opacity = "1";
        }
      });

      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isOpen, originRect]);

  // Reset image loaded state when photo changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  const currentPhoto = photos[currentIndex];
  const filename = `photo-${event}-${bibNumber ?? "all"}-${currentIndex + 1}.jpg`;

  const handleShare = async () => {
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: `Race Photo ${currentIndex + 1}`,
          text: `Check out this race photo from ${event}!`,
          url: currentPhoto,
        });
        toast.success("Photo shared successfully!");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          void handleCopyLink();
        }
      }
    } else {
      void handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    if (!currentPhoto) return;

    try {
      await navigator.clipboard.writeText(currentPhoto);
      toast.success("Photo link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDownload = async () => {
    if (!currentPhoto) return;

    try {
      const proxyUrl = `/api/download-image?url=${encodeURIComponent(currentPhoto)}&filename=${encodeURIComponent(filename)}`;
      const testResponse = await fetch(proxyUrl, { method: "HEAD" });

      if (testResponse.ok) {
        const link = document.createElement("a");
        link.href = proxyUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Photo download started!");
        return;
      }
    } catch {
      console.log("API proxy failed, trying direct download");
    }

    try {
      const response = await fetch(currentPhoto, { mode: "no-cors" });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Photo downloaded!");
    } catch {
      try {
        const link = document.createElement("a");
        link.href = currentPhoto;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.info("Photo opened in new tab. Right-click to save.");
      } catch {
        toast.error("Unable to download photo.");
      }
    }
  };

  const handleCloseWithAnimation = useCallback(() => {
    if (originRect && imageRef.current) {
      setIsAnimating(true);

      const startX = originRect.left + originRect.width / 2;
      const startY = originRect.top + originRect.height / 2;
      const endX = window.innerWidth / 2;
      const endY = window.innerHeight / 2;
      const scale = Math.min(
        (window.innerWidth * 0.9) / originRect.width,
        (window.innerHeight * 0.9) / originRect.height,
        3,
      );

      imageRef.current.style.transition =
        "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease";
      imageRef.current.style.transform = `translate(${startX - endX}px, ${startY - endY}px) scale(${1 / scale})`;
      imageRef.current.style.opacity = "0";

      setTimeout(() => {
        setIsAnimating(false);
        onClose();
      }, 300);
    } else {
      onClose();
    }
  }, [originRect, onClose]);

  if (!isOpen && !isAnimating) return null;
  if (!currentPhoto) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-white"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isAnimating) {
          handleCloseWithAnimation();
        }
      }}
    >
      {/* Single View Content Layer */}
      <div className="relative h-full w-full">
        {/* Header with controls */}
        <div
          className={cn(
            "absolute top-0 right-0 left-0 z-10 flex items-center justify-between p-4",
            isAnimating ? "opacity-0" : "opacity-100",
          )}
          style={{ transition: "opacity 0.3s ease" }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCloseWithAnimation}
            className="text-gray-700 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="text-sm font-medium text-gray-700">
            {currentIndex + 1} / {photos.length}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-gray-700 hover:bg-gray-100"
              title={isMobile ? "Share" : "Copy link"}
            >
              <Share className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-gray-700 hover:bg-gray-100"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation arrows */}
        {photos.length > 1 && !isAnimating && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute top-1/2 left-4 z-10 h-12 w-12 -translate-y-1/2 text-gray-700 hover:bg-gray-100"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute top-1/2 right-4 z-10 h-12 w-12 -translate-y-1/2 text-gray-700 hover:bg-gray-100"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Main image container */}
        <div
          className="flex h-full w-full items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isAnimating) {
              handleCloseWithAnimation();
            }
          }}
        >
          <div
            ref={imageRef}
            className="relative max-h-full max-w-full"
            style={{
              transformOrigin: "center",
            }}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-700" />
              </div>
            )}

            <Image
              src={currentPhoto}
              alt={`Photo ${currentIndex + 1}`}
              width={1200}
              height={800}
              className={cn(
                "max-h-[90vh] max-w-full object-contain",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
              style={{ transition: "opacity 0.2s ease" }}
              onLoad={() => {
                setImageLoaded(true);
              }}
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Mobile-specific bottom info */}
        {isMobile && !isAnimating && (
          <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-gray-100/80 to-transparent p-4 text-center">
            <p className="text-sm text-gray-600">{filename}</p>
          </div>
        )}

        {/* Touch areas for navigation on mobile */}
        {isMobile && photos.length > 1 && !isAnimating && (
          <>
            <div
              className="absolute top-0 bottom-0 left-0 z-5 w-1/3"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
            />
            <div
              className="absolute top-0 right-0 bottom-0 z-5 w-1/3"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
