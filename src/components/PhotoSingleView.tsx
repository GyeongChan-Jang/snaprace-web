"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSwipeable } from "react-swipeable";
import { X, ChevronLeft, ChevronRight, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ANIMATION_TIMINGS } from "@/utils/animation";
import {
  generatePhotoFilename,
  sharePhoto,
  downloadPhoto,
  getNextPhotoIndex,
  getPreviousPhotoIndex,
} from "@/utils/photo";
import { isMobileDevice } from "@/utils/device";

type NavigatorShare = Navigator & {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data?: ShareData) => boolean;
};

interface PhotoSingleViewProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  event?: string;
  bibNumber?: string;
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
  onPhotoChange,
}: PhotoSingleViewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  // Swipe handlers (react-swipeable will manage touch events)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sequential navigation (row-based: 1→2→3→4→5...)
  const handlePrevious = useCallback(() => {
    const newIndex = getPreviousPhotoIndex(currentIndex, photos.length);
    onIndexChange(newIndex);
    onPhotoChange?.(newIndex);
  }, [currentIndex, photos.length, onIndexChange, onPhotoChange]);

  const handleNext = useCallback(() => {
    const newIndex = getNextPhotoIndex(currentIndex, photos.length);
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

  // Animation effect - simplified with framer-motion handling most of it
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false); // Reset closing state when opening
      setIsAnimating(true);
      setShowOverlay(false);

      // Show overlay after a delay for natural flow
      setTimeout(() => {
        setShowOverlay(true);
        setIsAnimating(false);
      }, ANIMATION_TIMINGS.OVERLAY_DELAY);
    }
  }, [isOpen]);

  // Reset image loaded state when photo changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  const currentPhoto = photos[currentIndex];
  const filename = generatePhotoFilename(event ?? "", bibNumber, currentIndex);

  const handleShare = async () => {
    if (!currentPhoto) return;

    // Prefer native navigator.share on mobile
    if (isMobile && typeof navigator !== "undefined") {
      const nav = navigator as NavigatorShare;
      if (nav.share) {
        try {
          // Attempt to share with file for better UX when supported
          try {
            const response = await fetch(currentPhoto, { mode: "cors" });
            const blob = await response.blob();
            const fileToShare = new File([blob], filename, {
              type: blob.type || "image/jpeg",
            });
            const dataWithFiles = {
              files: [fileToShare],
              title: event ?? "SnapRace Photo",
              text: `Photo ${currentIndex + 1}/${photos.length}`,
            } as unknown as ShareData;
            if (nav.canShare?.(dataWithFiles)) {
              await nav.share({
                files: [fileToShare],
                title: event ?? "SnapRace Photo",
                text: `Photo ${currentIndex + 1}/${photos.length}`,
              });
              toast.success("Shared via device");
              return;
            }
          } catch {}

          // Fallback: share URL
          await nav.share({
            title: event ?? "SnapRace Photo",
            text: `Photo ${currentIndex + 1}/${photos.length}`,
            url: currentPhoto,
          });
          toast.success("Shared via device");
          return;
        } catch {
          // If native share fails, fall through to library util
        }
      }
    }

    try {
      await sharePhoto(currentPhoto, currentIndex, event ?? "", isMobile);
      toast.success("Photo shared successfully!");
    } catch {
      toast.error("Failed to share photo");
    }
  };

  const handleDownload = async () => {
    if (!currentPhoto) return;

    // On mobile, use Web Share with file to allow saving to device
    if (isMobile && typeof navigator !== "undefined") {
      const nav = navigator as NavigatorShare;
      if (nav.share) {
        try {
          const response = await fetch(currentPhoto, { mode: "cors" });
          const blob = await response.blob();
          const fileToShare = new File([blob], filename, {
            type: blob.type || "image/jpeg",
          });
          const dataWithFiles = {
            files: [fileToShare],
            title: filename,
          } as unknown as ShareData;
          if (nav.canShare?.(dataWithFiles)) {
            await nav.share({
              files: [fileToShare],
              title: filename,
            });
            toast.success("Shared to save/download on device");
            return;
          }
        } catch {
          // ignore and fallback
        }

        // Fallback on mobile: open the image URL in a new tab so user can save
        try {
          window.open(currentPhoto, "_blank", "noopener,noreferrer");
          toast.info("Opened in new tab. Use browser save.");
          return;
        } catch {}
      }
    }

    // Desktop or final fallback: use existing download helper
    const result = await downloadPhoto(currentPhoto, filename);
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
  };

  const handleCloseWithAnimation = useCallback(() => {
    if (isClosing || isAnimating) return; // Prevent multiple close attempts

    setIsClosing(true);
    setIsAnimating(true);
    setShowOverlay(false);

    // Close after animation completes
    setTimeout(() => {
      setIsClosing(false);
      setIsAnimating(false);
      onClose();
    }, 200);
  }, [onClose, isClosing, isAnimating]);

  const swipeable = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
    delta: 40,
  });
  const { ...swipeHandlers } = swipeable;

  if (!isOpen && !isAnimating && !isClosing) return null;
  if (!currentPhoto) return null;

  return (
    <div {...swipeHandlers} className="fixed inset-0 z-50 bg-white">
      {/* Single View Content Layer */}
      <div className="relative h-full w-full">
        {/* Header with controls */}
        <div
          className={cn(
            "absolute top-0 right-0 left-0 z-20 flex items-center justify-between p-4 transition-all duration-300 ease-out",
            showOverlay && !isAnimating
              ? "translate-y-0 opacity-100"
              : "-translate-y-2 opacity-0",
          )}
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

        {/* Desktop navigation arrows - appear on hover over left/right 1/3 */}
        {!isMobile && photos.length > 1 && (
          <>
            <div
              className="group absolute top-0 bottom-0 left-0 z-10 w-1/3 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (showOverlay && !isAnimating) handlePrevious();
              }}
            >
              <div className="absolute top-1/2 left-4 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className={cn(
                    "h-12 w-12 text-gray-700 opacity-0 transition-opacity hover:bg-gray-100",
                    showOverlay && !isAnimating
                      ? "group-hover:opacity-100"
                      : "opacity-0",
                  )}
                  disabled={!showOverlay || isAnimating}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              </div>
              {/* Prevent clicks on the header close/share/download from bubbling to this zone */}
              <div
                className="absolute top-0 right-0 left-0 h-16"
                style={{ pointerEvents: "none" }}
              />
            </div>

            <div
              className="group absolute top-0 right-0 bottom-0 z-10 w-1/3 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (showOverlay && !isAnimating) handleNext();
              }}
            >
              <div className="absolute top-1/2 right-4 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className={cn(
                    "h-12 w-12 text-gray-700 opacity-0 transition-opacity hover:bg-gray-100",
                    showOverlay && !isAnimating
                      ? "group-hover:opacity-100"
                      : "opacity-0",
                  )}
                  disabled={!showOverlay || isAnimating}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </div>
              <div
                className="absolute top-0 right-0 left-0 h-16"
                style={{ pointerEvents: "none" }}
              />
            </div>
          </>
        )}

        {/* Main image container */}
        <div
          className="flex h-full w-full items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && showOverlay && !isAnimating) {
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
        {isMobile && (
          <div
            className={cn(
              "absolute right-0 bottom-0 left-0 bg-gradient-to-t from-gray-100/80 to-transparent p-4 text-center transition-all duration-300 ease-out",
              showOverlay && !isAnimating
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
            )}
          >
            <p className="text-sm text-gray-600">{filename}</p>
          </div>
        )}

        {/* Mobile: swipe gestures handle navigation; no on-screen chevrons */}
      </div>
    </div>
  );
}
