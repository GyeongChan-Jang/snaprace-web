"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSwipeable } from "react-swipeable";
import { X, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ShareDialog } from "@/components/ShareDialog";

import {
  generatePhotoFilename,
  downloadPhoto,
  getNextPhotoIndex,
  getPreviousPhotoIndex,
  generateShareablePhotoUrl,
  downloadPhotoEnhanced,
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
  selfieMatchedSet?: Set<string>;
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
  selfieMatchedSet,
}: PhotoSingleViewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  // Swipe handlers (react-swipeable will manage touch events

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

  // Animations removed

  // Reset image loaded state when photo changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  const currentPhoto = photos[currentIndex];
  const filename = generatePhotoFilename(event ?? "", bibNumber, currentIndex);

  const handleShare = async () => {
    if (!currentPhoto) return;

    // Generate shareable URL for the photo
    const shareableUrl = generateShareablePhotoUrl(currentPhoto);

    // Prefer native navigator.share on mobile
    if (isMobile && typeof navigator !== "undefined") {
      const nav = navigator as NavigatorShare;
      if (nav.share) {
        try {
          // Share the shareable URL instead of the image file
          await nav.share({
            title: event ?? "SnapRace Photo",
            text: `Check out this race photo!`,
            url: shareableUrl,
          });
          toast.success("Shared successfully!");
          return;
        } catch (error) {
          // If user cancels, don't show error
          if ((error as Error).name === "AbortError") {
            return;
          }
          // Fall through to clipboard copy
        }
      }
    }

    // Fallback: copy shareable URL to clipboard
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast.success("Share link copied to clipboard!");
    } catch {
      toast.error("Failed to copy share link");
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

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const swipeable = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
    delta: 40,
  });
  const { ...swipeHandlers } = swipeable;

  if (!isOpen) return null;
  if (!currentPhoto) return null;

  return (
    <div {...swipeHandlers} className="fixed inset-0 z-50 bg-white">
      {/* Single View Content Layer */}
      <div className="relative h-full w-full">
        {/* Header with controls */}
        <div className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-gray-700 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="text-sm font-medium text-gray-700">
            {currentIndex + 1} / {photos.length}
          </div>

          <div className="flex items-center gap-2">
            <ShareDialog
              photoUrl={currentPhoto}
              filename={filename}
              isMobile={isMobile}
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-gray-100"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </ShareDialog>

            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                const result = await downloadPhotoEnhanced(
                  currentPhoto,
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
                handlePrevious();
              }}
            >
              <div className="absolute top-1/2 left-4 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="h-12 w-12 text-gray-700 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100"
                  disabled={false}
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
                handleNext();
              }}
            >
              <div className="absolute top-1/2 right-4 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="h-12 w-12 text-gray-700 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100"
                  disabled={false}
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
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            ref={imageRef}
            className="relative inline-block"
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
              className="h-auto max-h-[85vh] w-auto max-w-[90vw] object-contain"
              onLoad={() => setImageLoaded(true)}
              priority
              unoptimized
            />
            {selfieMatchedSet?.has(currentPhoto) && (
              <div className="absolute top-2 left-2 z-20">
                <Badge variant="default">
                  <span className="font-poppins text-xs">Selfie</span>
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-specific bottom info */}
        {isMobile && (
          <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-gray-100/80 to-transparent p-4 text-center">
            <p className="text-sm text-gray-600">{filename}</p>
          </div>
        )}

        {/* Mobile: swipe gestures handle navigation; no on-screen chevrons */}
      </div>
    </div>
  );
}
