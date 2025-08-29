"use client";

import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import {
  EventHeaderSkeleton,
  MasonryPhotoSkeleton,
} from "@/components/states/EventsSkeleton";
import { ErrorState } from "@/components/states/ErrorState";
import { NoPhotosState } from "@/components/states/EmptyState";
import { useSelfieUpload } from "@/hooks/useSelfieUpload";
import { PhotoSingleView } from "@/components/PhotoSingleView";
import { PhotoGrid } from "@/components/PhotoGrid";
import { usePhotoState } from "@/hooks/usePhotoState";
import { usePhotoHandlers } from "@/hooks/usePhotoHandlers";

export default function EventPhotoPage() {
  const router = useRouter();
  const photoRefs = useRef<Map<number, HTMLDivElement>>(new Map());

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
    clickedPhotoRect,
    setClickedPhotoRect,
  } = usePhotoState();

  // Use custom hooks for handlers
  const {
    handlePhotoClick,
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

  const galleryQuery = api.galleries.getByBibNumber.useQuery(
    { eventId: event, bibNumber },
    { enabled: !!event && !isAllPhotos && !!bibNumber },
  );

  const allPhotosQuery = api.galleries.getAllByEventId.useQuery(
    { eventId: event },
    { enabled: !!event && isAllPhotos },
  );

  // Selfie upload hook
  const { isProcessing: isUploading, uploadSelfie } = useSelfieUpload({
    eventId: event,
    bibNumber,
    organizerId: "default", // TODO: Get from context or props
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadSelfie(file);
    }
  };

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
      allPhotosQuery.data.forEach((item) => {
        const selfiePhotos = item.selfie_matched_photos ?? [];
        const bibPhotos = item.bib_matched_photos ?? [];
        allPhotos.push(...selfiePhotos, ...bibPhotos);
      });
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

  // Loading states
  const isLoading =
    eventQuery.isLoading ?? galleryQuery.isLoading ?? allPhotosQuery.isLoading;
  const hasError =
    eventQuery.error ?? galleryQuery.error ?? allPhotosQuery.error;

  if (hasError) {
    return <ErrorState message="Failed to load event data" />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with max width constraint */}
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-6">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              {isLoading ? (
                <EventHeaderSkeleton />
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {eventQuery.data?.event_name ?? event}
                  </h1>
                  {!isAllPhotos && bibNumber && (
                    <p className="mt-1 text-lg text-gray-600">
                      Bib #{bibNumber} Photos
                    </p>
                  )}
                  {isAllPhotos && (
                    <p className="mt-1 text-lg text-gray-600">All Photos</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search and Upload Section */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Bib Search */}
            {isAllPhotos && (
              <form onSubmit={handleBibSearch} className="flex gap-2">
                <Input
                  placeholder="Enter bib number to find photos..."
                  value={searchBib}
                  onChange={(e) => setSearchBib(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="shrink-0">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </form>
            )}

            {/* Selfie Upload */}
            {!isAllPhotos && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={isUploading}
                  />
                  <Button
                    variant="outline"
                    disabled={isUploading}
                    className="cursor-pointer"
                  >
                    {isUploading
                      ? "Uploading..."
                      : "Upload Selfie to Find More Photos"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-width Photo Grid */}
      <div className="w-full px-4 sm:px-6">
        {isLoading ? (
          <MasonryPhotoSkeleton />
        ) : photos.length > 0 ? (
          <PhotoGrid
            photos={photos}
            columnCount={columnCount}
            isMobile={isMobile}
            onPhotoClick={handlePhotoClick}
            onShare={handleShare}
            onDownload={handleDownload}
            photoRefs={photoRefs}
          />
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
      />
    </div>
  );
}
