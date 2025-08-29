"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Search, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  EventHeaderSkeleton,
  MasonryPhotoSkeleton,
} from "@/components/states/EventsSkeleton";
import { ErrorState } from "@/components/states/ErrorState";
import { NoPhotosState } from "@/components/states/EmptyState";
import { useSelfieUpload } from "@/hooks/useSelfieUpload";
import { PhotoSingleView } from "@/components/PhotoSingleView";
import type { GalleryItem } from "@/server/api/routers/galleries";

export default function EventPhotoPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const event = params?.event as string;
  const bibParam = params?.bib as string;
  const isAllPhotos = bibParam === "null";
  const bibNumber = isAllPhotos ? "" : bibParam;

  const [searchBib, setSearchBib] = useState(bibNumber || "");
  const [columnCount, setColumnCount] = useState(4);
  const [isMobile, setIsMobile] = useState(false);
  const [clickedPhotoRect, setClickedPhotoRect] = useState<DOMRect | null>(
    null,
  );
  const photoRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollPositionRef = useRef(0);

  // Parse URL params for SingleView state
  const photoIndex = searchParams.get("idx");
  const scrollPosition = searchParams.get("scroll");
  const isModalOpen = photoIndex !== null;
  const currentPhotoIndex = photoIndex ? parseInt(photoIndex, 10) : 0;

  // Fetch event info
  const eventQuery = api.events.getById.useQuery(
    { eventId: event },
    { enabled: !!event },
  );

  // Fetch gallery data for specific bib
  const galleryQuery = api.galleries.getByBibNumber.useQuery(
    { eventId: event, bibNumber },
    { enabled: !!bibNumber && !!event && !isAllPhotos },
  );

  // Fetch all photos for event
  const allPhotosQuery = api.photos.getByEventId.useQuery(
    { eventId: event },
    { enabled: !!event && isAllPhotos },
  );

  const { uploadSelfie, isProcessing, uploadedFile, reset } = useSelfieUpload({
    bibNumber,
    eventId: event,
    organizerId: eventQuery.data?.organization_id ?? "",
  });

  // Handle selfie upload
  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const results = await uploadSelfie(file);
    if (results) {
      // Refetch gallery data to get updated photos including selfie matches
      await galleryQuery.refetch();
    }

    // Reset the input value to allow re-uploading the same file
    e.target.value = "";
  };

  // Handle bib search
  const handleBibSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchBib.trim()) {
      router.push(`/events/${event}/${searchBib.trim()}`);
    }
  };

  // Process photos data
  const photos = useMemo(() => {
    if (isAllPhotos && allPhotosQuery.data) {
      return allPhotosQuery.data.map((photo) => photo.imageUrl);
    }

    if (!isAllPhotos && galleryQuery.data) {
      const data = galleryQuery.data;
      const selfiePhotos = data.selfie_matched_photos ?? [];
      const bibPhotos = data.bib_matched_photos ?? [];

      // Prioritize selfie matched photos
      return [...selfiePhotos, ...bibPhotos];
    }

    return [];
  }, [isAllPhotos, allPhotosQuery.data, galleryQuery.data]);

  // Responsive column count and mobile detection
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      if (width < 835) setColumnCount(2);
      else if (width < 1035) setColumnCount(3);
      else if (width < 1535) setColumnCount(4);
      else setColumnCount(5);

      // Mobile detection
      setIsMobile(width < 768 || "ontouchstart" in window);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  // Restore scroll position when closing SingleView
  useEffect(() => {
    if (scrollPosition && !isModalOpen) {
      window.scrollTo(0, parseInt(scrollPosition, 10));
    }
  }, [scrollPosition, isModalOpen]);

  // Save scroll position periodically
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle photo click
  const handlePhotoClick = useCallback(
    (index: number) => {
      const photoElement = photoRefs.current.get(index);
      if (photoElement) {
        setClickedPhotoRect(photoElement.getBoundingClientRect());
      }

      // Update URL with photo index and current scroll position
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("idx", index.toString());
      newParams.set("scroll", scrollPositionRef.current.toString());
      router.push(`/events/${event}/${bibParam}?${newParams.toString()}`, {
        scroll: false,
      });
    },
    [event, bibParam, router, searchParams],
  );

  // Handle SingleView close
  const handleModalClose = useCallback(() => {
    // Remove query params but keep scroll position
    router.push(`/events/${event}/${bibParam}`, { scroll: false });

    // Scroll to the photo position if needed
    if (scrollPosition) {
      void setTimeout(() => {
        window.scrollTo(0, parseInt(scrollPosition, 10));
      }, 100);
    }
  }, [event, bibParam, router, scrollPosition]);

  // Handle photo index change in SingleView
  const handlePhotoIndexChange = useCallback(
    (newIndex: number) => {
      // Update scroll position reference without actually scrolling
      // This keeps the background in sync but doesn't show the movement
      const photoElement = photoRefs.current.get(newIndex);
      let targetScroll = scrollPositionRef.current;

      if (photoElement) {
        const rect = photoElement.getBoundingClientRect();
        const currentScroll = window.scrollY;

        // Calculate where we would need to scroll to center this photo
        const elementTop = rect.top + currentScroll;
        const windowHeight = window.innerHeight;
        targetScroll = elementTop - windowHeight / 2 + rect.height / 2;
        targetScroll = Math.max(0, targetScroll);

        // Update our scroll reference for when the modal closes
        scrollPositionRef.current = targetScroll;
      }

      // Update URL with new index and calculated scroll position
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("idx", newIndex.toString());
      newParams.set("scroll", targetScroll.toString());
      router.push(`/events/${event}/${bibParam}?${newParams.toString()}`, {
        scroll: false,
      });
    },
    [event, bibParam, router, searchParams],
  );

  // Handle photo actions
  const handleShare = async (photoUrl: string, index?: number) => {
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: `Race Photo ${(index ?? 0) + 1}`,
          text: `Check out this race photo from ${event}!`,
          url: photoUrl,
        });
        toast.success("Photo shared successfully!");
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return; // User cancelled
        }
      }
    }

    // Fallback to copy link
    try {
      await navigator.clipboard.writeText(photoUrl);
      toast.success("Photo link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link. Please copy manually.");
    }
  };

  const handleDownload = async (photoUrl: string, index: number) => {
    const filename = `photo-${event}-${bibNumber || "all"}-${index + 1}.jpg`;

    try {
      // Method 1: Try using our proxy API route
      const proxyUrl = `/api/download-image?url=${encodeURIComponent(photoUrl)}&filename=${encodeURIComponent(filename)}`;

      // Test if our API route works
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
      // Method 2: Try direct download with fetch (may fail due to CORS)
      const response = await fetch(photoUrl, { mode: "no-cors" });
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
      // Method 3: Fallback - open in new tab
      try {
        const link = document.createElement("a");
        link.href = photoUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.info(
          "Photo opened in new tab. Right-click and 'Save Image As' to download.",
        );
      } catch {
        toast.error(
          "Unable to download photo. Please copy the image URL manually.",
        );
      }
    }
  };

  // Loading state
  if (eventQuery.isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <EventHeaderSkeleton />
          <MasonryPhotoSkeleton count={12} />
        </div>
      </div>
    );
  }

  // Error state
  if (eventQuery.error || !eventQuery.data) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Event not found</h1>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const eventInfo = eventQuery.data;
  const galleryData = galleryQuery.data as GalleryItem | undefined;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="text-center">
              <h1 className="text-xl font-semibold">{eventInfo.event_name}</h1>
              <p className="text-muted-foreground text-sm">
                {!isAllPhotos && bibNumber ? (
                  <>
                    Bib #{bibNumber}{" "}
                    {galleryData?.runner_name && (
                      <>• {galleryData.runner_name}</>
                    )}
                  </>
                ) : (
                  "All Photos"
                )}
                {" • "}
                {photos.length} photo{photos.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="w-24">
              {/* {!isAllPhotos && bibNumber ? (
                <p className="text-muted-foreground text-sm">
                  Bib #{bibNumber}{" "}
                  {galleryData?.runner_name && `• ${galleryData.runner_name}`}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">All Photos</p>
              )}
              <p className="text-muted-foreground text-xs">
                {photos.length} photo{photos.length !== 1 ? "s" : ""} found
              </p> */}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 py-6">
        {/* Search and Upload Section */}
        <div className="mx-auto mb-8 max-w-3xl">
          <div className="bg-muted/50 rounded-lg p-6">
            {/* Bib Search */}
            <div className="mb-6">
              <h3 className="mb-3 text-center text-lg font-medium">
                Find Your Photos
              </h3>
              <form
                onSubmit={handleBibSearch}
                className="mx-auto flex max-w-md gap-2"
              >
                <Input
                  type="text"
                  placeholder="Enter your bib number"
                  value={searchBib}
                  onChange={(e) => setSearchBib(e.target.value)}
                  className="h-10 border border-gray-200"
                />
                <Button
                  type="submit"
                  disabled={!searchBib.trim()}
                  size="default"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>
            </div>

            {/* Selfie Upload */}
            <div className="mx-auto max-w-md border-t pt-6">
              <div className="mb-4 text-center">
                <h4 className="text-base font-medium">
                  Find More Photos with Face Matching
                </h4>
                <p className="text-muted-foreground mt-1 text-sm">
                  {!bibNumber
                    ? "Enter your bib number first to enable face matching"
                    : "Upload a clear selfie to discover additional photos"}
                </p>
              </div>

              <div>
                <input
                  id="selfie-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleSelfieUpload}
                  className="hidden"
                  disabled={isProcessing || !bibNumber}
                />
                <label htmlFor="selfie-upload" className="block">
                  <div
                    className={`${
                      !bibNumber || isProcessing
                        ? "cursor-not-allowed"
                        : "hover:border-primary/40 hover:bg-muted/30 cursor-pointer"
                    } ${
                      !bibNumber ? "opacity-60" : ""
                    } group border-muted-foreground/20 bg-muted/10 relative overflow-hidden rounded-lg border-2 border-dashed p-6 transition-all`}
                  >
                    {/* Processing Overlay */}
                    {isProcessing && (
                      <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                          <div className="border-primary/30 border-t-primary h-10 w-10 animate-spin rounded-full border-4" />
                          <p className="text-sm font-medium">Processing...</p>
                          <p className="text-muted-foreground text-xs">
                            This may take a moment
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Success Overlay */}
                    {uploadedFile &&
                      !isProcessing &&
                      galleryData?.selfie_enhanced && (
                        <div className="bg-background/90 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                              <svg
                                className="h-6 w-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">Success!</p>
                              <p className="text-muted-foreground text-xs">
                                Found {galleryData.selfie_matched_photos.length}{" "}
                                photo
                                {galleryData.selfie_matched_photos.length > 1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                reset();
                              }}
                            >
                              Upload another
                            </Button>
                          </div>
                        </div>
                      )}

                    {/* Default Content */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative h-20 w-20">
                        <Image
                          src="/images/selfie-upload.png"
                          alt="Upload selfie"
                          width={80}
                          height={80}
                          className={`${
                            !bibNumber ? "grayscale" : ""
                          } transition-all`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          {!bibNumber
                            ? "Bib number required"
                            : uploadedFile
                              ? uploadedFile.name
                              : "Click to upload your selfie"}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {!bibNumber
                            ? "Please enter bib number above"
                            : uploadedFile
                              ? `${(uploadedFile.size / 1024 / 1024).toFixed(1)} MB`
                              : "JPG, PNG or HEIC • Max 10MB"}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Alternative simple status for no photos found */}
              {uploadedFile &&
                !isProcessing &&
                galleryData &&
                galleryData.selfie_matched_photos.length === 0 && (
                  <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <div className="flex items-center gap-2 text-sm">
                      <svg
                        className="h-4 w-4 text-yellow-600 dark:text-yellow-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p className="whitespace-pre-line text-yellow-700 dark:text-yellow-400">
                        {
                          "No additional photos found.\nTry uploading a different selfie."
                        }
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          reset();
                        }}
                        className="ml-auto text-xs"
                      >
                        Try again
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        {(!isAllPhotos && galleryQuery.isLoading) ||
        (isAllPhotos && allPhotosQuery.isLoading) ? (
          <MasonryPhotoSkeleton count={12} />
        ) : (!isAllPhotos && galleryQuery.isError) ||
          (isAllPhotos && allPhotosQuery.isError) ? (
          <ErrorState
            title="Unable to load photos"
            message="There was an error loading photos. Please try again."
            onRetry={() => {
              if (!isAllPhotos) {
                void galleryQuery.refetch();
              } else {
                void allPhotosQuery.refetch();
              }
            }}
          />
        ) : photos.length > 0 ? (
          <div className="mx-auto max-w-7xl">
            <div
              className="masonry-grid"
              style={{
                columnCount: columnCount,
                columnGap: "8px",
              }}
            >
              {photos.map((url, index) => (
                <div
                  key={`photo-${index}`}
                  ref={(el) => {
                    if (el) photoRefs.current.set(index, el);
                    else photoRefs.current.delete(index);
                  }}
                  className="masonry-item group mb-2 cursor-pointer break-inside-avoid"
                  onClick={() => handlePhotoClick(index)}
                >
                  <div className="relative overflow-hidden">
                    {/* Desktop Hover Overlay */}
                    {!isMobile && (
                      <div className="absolute inset-0 z-10 flex items-start justify-end gap-1 bg-gradient-to-b from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleShare(url, index);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 transition-colors hover:bg-white"
                          title="Share"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDownload(url, index);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 transition-colors hover:bg-white"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <Image
                      src={url}
                      alt={`Photo ${index + 1}`}
                      width={400}
                      height={300}
                      className="h-auto w-full transition-transform duration-200 hover:scale-[1.02]"
                      sizes="(max-width: 835px) 50vw, (max-width: 1035px) 33vw, (max-width: 1535px) 25vw, 20vw"
                      priority={index < 4}
                    />
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 text-white">
                      <p className="text-sm">
                        {index + 1} / {photos.length}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <NoPhotosState
            isAllPhotos={isAllPhotos}
            bibNumber={bibNumber}
            onViewAllPhotos={
              !isAllPhotos
                ? () => router.push(`/events/${event}/null`)
                : undefined
            }
          />
        )}
      </div>

      {/* Photo SingleView */}
      <PhotoSingleView
        isOpen={isModalOpen}
        onClose={handleModalClose}
        photos={photos}
        currentIndex={currentPhotoIndex}
        onIndexChange={handlePhotoIndexChange}
        event={event}
        bibNumber={bibNumber}
        originRect={clickedPhotoRect}
        onPhotoChange={(index) => {
          // Update clicked photo rect when navigating
          const photoElement = photoRefs.current.get(index);
          if (photoElement) {
            setClickedPhotoRect(photoElement.getBoundingClientRect());
          }
        }}
      />
    </div>
  );
}
