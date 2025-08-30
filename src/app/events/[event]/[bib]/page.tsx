"use client";

import { useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { MasonryPhotoSkeleton } from "@/components/states/EventsSkeleton";
import { ErrorState } from "@/components/states/ErrorState";
import { NoPhotosState } from "@/components/states/EmptyState";
import { useSelfieUpload } from "@/hooks/useSelfieUpload";
import { PhotoSingleView } from "@/components/PhotoSingleView";
import { PhotoGrid } from "@/components/PhotoGrid";
import { InfinitePhotoGrid } from "@/components/InfinitePhotoGrid";
import { usePhotoState } from "@/hooks/usePhotoState";
import { usePhotoHandlers } from "@/hooks/usePhotoHandlers";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventPhotoPage() {
  const router = useRouter();
  const photoRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use custom hooks for state management
  const {
    event,
    bibParam,
    bibNumber,
    isAllPhotos,
    searchBib,
    setSearchBib,
    columnCount,
    isMobile,
    isModalOpen,
    currentPhotoIndex,
    setClickedPhotoRect,
  } = usePhotoState();

  // Use custom hooks for handlers
  const {
    handlePhotoClick, // Handle photo click to open SingleView
    handlePhotoIndexChange,
    handleCloseSingleView,
    handleShare,
    handleDownload,
  } = usePhotoHandlers({
    event,
    bibParam,
    isMobile,
    photoRefs,
    setClickedPhotoRect,
  });

  // API queries
  const eventQuery = api.events.getById.useQuery(
    { eventId: event },
    { enabled: !!event },
  );

  // if [bib] is not null, get the photos for the bib number
  const galleryQuery = api.galleries.getByBibNumber.useQuery(
    { eventId: event, bibNumber },
    { enabled: !!event && !isAllPhotos && !!bibNumber },
  );

  const allPhotosQuery = api.photos.getByEventId.useQuery(
    { eventId: event },
    { enabled: !!event && isAllPhotos },
  );

  // Selfie upload hook
  const {
    isProcessing: isUploading,
    uploadSelfie,
    uploadedFile,
    reset,
  } = useSelfieUpload({
    eventId: event,
    bibNumber,
    organizerId: eventQuery.data?.organization_id ?? "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Upload selfie and then refetch gallery only on success
      const success = await uploadSelfie(file);
      if (success) {
        await galleryQuery.refetch();
      }
    }
    // Always clear input so selecting the same file triggers onChange again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Unified retry helper for both "Upload another" and "Try again"
  const resetAndPromptSelfieUpload = useCallback(() => {
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      // Open the file picker immediately for a smooth retry flow
      fileInputRef.current.click();
    }
  }, [reset]);

  // Bib search handler
  const handleBibSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchBib.trim()) {
      router.push(`/events/${event}/${searchBib.trim()}`);
    }
  };

  // Process photos data
  const photos = useMemo(() => {
    if (isAllPhotos && allPhotosQuery.data) {
      // Flatten all photos from all gallery items
      const allPhotos: string[] = [];
      if (allPhotosQuery.data) {
        allPhotosQuery.data.forEach((photo) => {
          allPhotos.push(photo.imageUrl);
        });
      }
      return allPhotos;
    }

    if (!isAllPhotos && galleryQuery.data) {
      const data = galleryQuery.data;
      const selfiePhotos = data.selfie_matched_photos ?? [];
      const bibPhotos = data.bib_matched_photos ?? [];
      return [...selfiePhotos, ...bibPhotos];
    }

    return [];
  }, [isAllPhotos, allPhotosQuery.data, galleryQuery.data]);

  // selfie로 매칭된 사진 URL 집합 (상단 배지 표시에 사용)
  const selfieMatchedSet = useMemo(() => {
    if (!isAllPhotos && galleryQuery.data?.selfie_matched_photos?.length) {
      return new Set(galleryQuery.data.selfie_matched_photos);
    }
    return new Set<string>();
  }, [isAllPhotos, galleryQuery.data?.selfie_matched_photos]);

  const isLoading =
    eventQuery.isLoading || galleryQuery.isLoading || allPhotosQuery.isLoading;

  const hasError =
    eventQuery.error || galleryQuery.error || allPhotosQuery.error;

  if (hasError) {
    return <ErrorState message="Failed to load event data" />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 flex h-16 items-center border-b backdrop-blur md:h-18">
        <div className="container mx-auto px-1 md:px-4">
          <div className="flex items-center">
            {/* {isLoading ? (
              <>
                <div className="w-10 md:w-auto">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <div className="flex-1 px-2 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                    <Skeleton className="h-5 w-40 md:h-6 md:w-56" />
                    <Skeleton className="h-3 w-48 md:w-64" />
                  </div>
                </div>
                <div className="w-10 md:w-auto">
                  <div className="hidden items-center gap-2 md:flex">
                    <Skeleton className="h-9 w-[160px]" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md md:hidden" />
                </div>
              </>
            ) : ( */}

            <div className="w-10 md:w-auto">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-2 w-2 md:h-4 md:w-4" />
                <span className="hidden md:block">Back</span>
              </Button>
            </div>

            <div className="flex-1 text-center">
              {isLoading ? (
                <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                  <Skeleton className="h-5 w-48 md:h-6 md:w-70" />
                  <Skeleton className="h-3 w-40 md:w-56" />
                </div>
              ) : (
                <>
                  <h1 className="text-sm font-semibold md:text-xl">
                    {eventQuery.data?.event_name}
                  </h1>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {!isAllPhotos && bibNumber ? (
                      <>
                        Bib #{bibNumber}{" "}
                        {galleryQuery.data?.runner_name && (
                          <>• {galleryQuery.data.runner_name}</>
                        )}
                      </>
                    ) : (
                      "All Photos"
                    )}
                    {" • "}
                    {photos.length} photo{photos.length !== 1 ? "s" : ""}
                  </p>
                </>
              )}
            </div>

            <div className="w-10 md:w-auto">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => router.push("/")}
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </Button>
              <form
                onSubmit={handleBibSearch}
                className="hidden items-center gap-2 md:flex"
              >
                <Input
                  type="text"
                  placeholder="Enter bib"
                  value={searchBib}
                  onChange={(e) => setSearchBib(e.target.value)}
                  className="w-[100px] border border-gray-200"
                />
                <Button type="submit" size="sm" disabled={!searchBib.trim()}>
                  <Search />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Upload Section */}
      <div className="mx-1 my-8 max-w-3xl md:mx-auto">
        <div className="bg-muted/50 rounded-lg p-6">
          {/* Partners & Sponsors (above selfie upload) */}
          <div className="mx-auto mb-6 grid max-w-3xl gap-4 sm:grid-cols-2">
            {/* Partners */}
            <div className="border-border/60 bg-background/60 rounded-xl border p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                <p className="text-muted-foreground text-xs font-medium tracking-wide">
                  Partners
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-10 w-36 md:h-12 md:w-40">
                  <Image
                    src="/images/partners/partner-millennium-running.png"
                    alt="Millennium Running"
                    fill
                    className="object-contain opacity-70 transition-opacity hover:opacity-100"
                    sizes="(max-width: 768px) 144px, 160px"
                  />
                </div>
              </div>
            </div>

            {/* Sponsors */}
            <div className="border-border/60 bg-background/60 rounded-xl border p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                <p className="text-muted-foreground text-xs font-medium tracking-wide">
                  Sponsors
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-10 w-36 md:h-12 md:w-40">
                  <Image
                    src="/images/partners/partner-autofair.png"
                    alt="AutoFair"
                    fill
                    className="object-contain opacity-70 transition-opacity hover:opacity-100"
                    sizes="(max-width: 768px) 144px, 160px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selfie Upload */}
          <div className="mx-auto max-w-md">
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
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading || !bibNumber}
                ref={fileInputRef}
              />
              <label htmlFor="selfie-upload" className="block">
                <div
                  className={`${
                    !bibNumber || isUploading
                      ? "cursor-not-allowed"
                      : "hover:border-primary/40 hover:bg-muted/30 cursor-pointer"
                  } ${
                    !bibNumber ? "opacity-60" : ""
                  } group border-muted-foreground/20 bg-muted/10 relative overflow-hidden rounded-lg border-2 border-dashed p-6 transition-all`}
                >
                  {/* Processing Overlay */}
                  {isUploading && (
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
                    !isUploading &&
                    galleryQuery.data?.selfie_enhanced && (
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
                              Found{" "}
                              {galleryQuery.data?.selfie_matched_photos.length}{" "}
                              photo
                              {galleryQuery.data?.selfie_matched_photos.length >
                              1
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
                              resetAndPromptSelfieUpload();
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

            {/* No additional photos status (only after selfie processing is reflected in data) */}
            {uploadedFile &&
              !isUploading &&
              galleryQuery.isFetched &&
              !galleryQuery.isFetching &&
              galleryQuery.data?.selfie_enhanced === true &&
              (galleryQuery.data.selfie_matched_photos?.length ?? 0) === 0 && (
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
                        resetAndPromptSelfieUpload();
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

      {/* Full-width Photo Grid */}
      <div className="w-full px-[4px] sm:px-[20px]">
        {isLoading ? (
          <MasonryPhotoSkeleton />
        ) : photos.length > 0 ? (
          isAllPhotos ? (
            <InfinitePhotoGrid
              photos={photos}
              columnCount={columnCount}
              isMobile={isMobile}
              onPhotoClick={handlePhotoClick}
              onShare={handleShare}
              onDownload={handleDownload}
              photoRefs={photoRefs}
            />
          ) : (
            <PhotoGrid
              photos={photos}
              columnCount={columnCount}
              isMobile={isMobile}
              onPhotoClick={handlePhotoClick}
              onShare={handleShare}
              onDownload={handleDownload}
              photoRefs={photoRefs}
              selfieMatchedSet={selfieMatchedSet}
            />
          )
        ) : (
          <NoPhotosState
            isAllPhotos={isAllPhotos}
            bibNumber={bibNumber}
            onViewAllPhotos={() => router.push(`/events/${event}/null`)}
          />
        )}
      </div>

      {/* Photo Single View Modal */}
      <PhotoSingleView
        isOpen={isModalOpen}
        onClose={handleCloseSingleView}
        photos={photos}
        currentIndex={Math.min(currentPhotoIndex, photos.length - 1)}
        onIndexChange={handlePhotoIndexChange}
        event={event}
        bibNumber={bibNumber}
        onPhotoChange={(index) => {
          // Update clicked photo rect when navigating
          const photoElement = photoRefs.current.get(index);
          if (photoElement) {
            setClickedPhotoRect(photoElement.getBoundingClientRect());
          }
        }}
        selfieMatchedSet={selfieMatchedSet}
      />
    </div>
  );
}
