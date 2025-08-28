"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Search, Download, Clipboard } from "lucide-react";
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

interface GalleryData {
  bib_matched_photos?: string[];
  selfie_matched_photos?: string[];
  selfie_enhanced?: boolean;
  runner_name?: string;
}

export default function EventPhotoPage() {
  const params = useParams();
  const router = useRouter();
  const event = params?.event as string;
  const bibParam = params?.bib as string;
  const isAllPhotos = bibParam === "null";
  const bibNumber = isAllPhotos ? "" : bibParam;

  const [searchBib, setSearchBib] = useState(bibNumber || "");
  const [columnCount, setColumnCount] = useState(4);
  const [selfieMatchedPhotos, setSelfieMatchedPhotos] = useState<string[]>([]);

  // Fetch event info
  const eventQuery = api.events.getById.useQuery(
    { eventId: event },
    { enabled: !!event },
  );

  // Fetch gallery data for specific bib
  const galleryQuery = api.galleries.get.useQuery(
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
      setSelfieMatchedPhotos(results);
      // Refetch gallery data to get updated photos
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
      const data = galleryQuery.data as GalleryData;
      const selfiePhotos = data.selfie_matched_photos ?? [];
      const bibPhotos = data.bib_matched_photos ?? [];
      const additionalSelfiePhotos = selfieMatchedPhotos;

      // Prioritize selfie matched photos
      return [...selfiePhotos, ...additionalSelfiePhotos, ...bibPhotos];
    }

    return [];
  }, [
    isAllPhotos,
    allPhotosQuery.data,
    galleryQuery.data,
    selfieMatchedPhotos,
  ]);

  // Responsive column count
  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width < 835) setColumnCount(2);
      else if (width < 1035) setColumnCount(3);
      else if (width < 1535) setColumnCount(4);
      else setColumnCount(5);
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  // Handle photo actions
  const handleShare = async (photoUrl: string) => {
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
    } catch (apiError) {
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
    } catch (corsError) {
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
      } catch (fallbackError) {
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
  // const galleryData = galleryQuery.data as GalleryData | undefined;

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
                  <>Bib #{bibNumber}</>
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
                      selfieMatchedPhotos.length > 0 && (
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
                                Found {selfieMatchedPhotos.length} photo
                                {selfieMatchedPhotos.length > 1 ? "s" : ""}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelfieMatchedPhotos([]);
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
                selfieMatchedPhotos.length === 0 && (
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
                          setSelfieMatchedPhotos([]);
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
                  className="masonry-item group mb-2 break-inside-avoid"
                >
                  <div className="relative overflow-hidden">
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 z-10 flex items-start justify-end gap-1 bg-gradient-to-b from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {/* <button
                        onClick={() => handleShare(url)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 transition-colors hover:bg-white"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </button> */}
                      <button
                        onClick={() => handleShare(url)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 transition-colors hover:bg-white"
                        title="Share"
                      >
                        <Clipboard className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(url, index)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 transition-colors hover:bg-white"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>

                    <Image
                      src={url}
                      alt={`Photo ${index + 1}`}
                      width={400}
                      height={300}
                      className="h-auto w-full"
                      sizes="(max-width: 835px) 50vw, (max-width: 1035px) 33vw, (max-width: 1535px) 25vw, 20vw"
                      priority={index < 4}
                    />
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
    </div>
  );
}
