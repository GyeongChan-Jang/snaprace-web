"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
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

interface PhotoData {
  id: string;
  url: string;
  width?: number;
  height?: number;
}

interface GalleryData {
  bib_matched_photos?: string[];
  selfie_matched_photos?: string[];
}

export default function EventPhotoPage() {
  const params = useParams();
  const router = useRouter();
  const event = params?.event as string;
  const bibParam = params?.bib as string;
  const isAllPhotos = bibParam === "null";
  const bibNumber = isAllPhotos ? "" : bibParam;

  const [searchBib, setSearchBib] = useState("");
  const [columnCount, setColumnCount] = useState(4);

  // Fetch event info from API
  const eventQuery = api.events.getById.useQuery(
    { eventId: event },
    { enabled: !!event },
  );

  const handleBibSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchBib.trim()) {
      router.push(`/events/${event}/${searchBib.trim()}`);
    }
  };

  // Fetch specific bib data from DynamoDB using tRPC (only when not showing all photos)
  const bibQuery = api.galleries.get.useQuery(
    { eventId: event, bibNumber },
    {
      enabled: !!bibNumber && !!event && !isAllPhotos,
    },
  );

  // Fetch all photos for the event when showing all photos
  const allPhotosQuery = api.photos.getByEventId.useQuery(
    { eventId: event },
    {
      enabled: !!event && isAllPhotos,
    },
  );

  // Transform photos data for masonry
  const photos: PhotoData[] = useMemo(() => {
    if (isAllPhotos && allPhotosQuery.data) {
      return allPhotosQuery.data.map((photo, index) => ({
        id: `photo-${event}-${index + 1}`,
        url: photo.imageUrl,
        width: 300,
        height: 300, // Remove random height, let image determine its own size
      }));
    } else if (!isAllPhotos && bibQuery.data) {
      const dynamoData = bibQuery.data as GalleryData;
      const bibPhotos = dynamoData.bib_matched_photos ?? [];
      const selfiePhotos = dynamoData.selfie_matched_photos ?? [];
      const allPhotos = [...bibPhotos, ...selfiePhotos];

      return allPhotos.map((url: string, index: number) => ({
        id: `photo-${event}-${bibNumber}-${index + 1}`,
        url,
        width: 300,
        height: 300, // Remove random height, let image determine its own size
      }));
    }
    return [];
  }, [isAllPhotos, allPhotosQuery.data, bibQuery.data, event, bibNumber]);

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

  const eventInfo = eventQuery.data;

  if (eventQuery.isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <EventHeaderSkeleton />
          <MasonryPhotoSkeleton count={12} />
        </div>
      </div>
    );
  }

  if (eventQuery.error || !eventInfo) {
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
              {!isAllPhotos ? (
                <p className="text-muted-foreground text-sm">
                  Bib #{bibNumber}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {photos.length} {photos.length === 1 ? "Photo" : "Photos"}
                </p>
              )}
            </div>

            {/* Search */}
            <form
              onSubmit={handleBibSearch}
              className="flex w-[200px] items-center gap-2"
            >
              <Input
                type="text"
                placeholder="Bib number"
                value={searchBib}
                onChange={(e) => setSearchBib(e.target.value)}
                className="h-8 w-full border-b border-gray-200 text-sm"
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="h-8 px-3"
                disabled={!searchBib.trim()}
              >
                <Search className="h-3 w-3" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 py-6">
        {(!isAllPhotos && bibQuery.isLoading) ||
        (isAllPhotos && allPhotosQuery.isLoading) ? (
          <MasonryPhotoSkeleton count={12} />
        ) : (!isAllPhotos && bibQuery.isError) ||
          (isAllPhotos && allPhotosQuery.isError) ? (
          <ErrorState
            title="Unable to load photos"
            message={`There was an error loading photos: ${
              !isAllPhotos
                ? bibQuery.error?.message
                : allPhotosQuery.error?.message
            }`}
            onRetry={() => {
              if (!isAllPhotos) {
                void bibQuery.refetch();
              } else {
                void allPhotosQuery.refetch();
              }
            }}
          />
        ) : photos.length > 0 ? (
          /* Pixieset-style Masonry Grid */
          <div className="mx-auto max-w-7xl">
            <div
              className="masonry-grid gap-2"
              style={{
                columnCount: columnCount,
                columnGap: "8px",
              }}
            >
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="masonry-item group mb-2 cursor-pointer break-inside-avoid"
                  style={{
                    display: "inline-block",
                    width: "100%",
                  }}
                >
                  <div className="bg-muted relative overflow-hidden transition-all duration-300 hover:shadow-lg">
                    {/* Grid Overlay - Pixieset Style */}
                    <div className="absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute inset-0 bg-black/20" />
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 transition-colors hover:bg-white hover:text-black">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 transition-colors hover:bg-white hover:text-black">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                            />
                          </svg>
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 transition-colors hover:bg-white hover:text-black">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <Image
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      width={400}
                      height={300}
                      className="h-auto w-full object-cover"
                      sizes="(max-width: 835px) 50vw, (max-width: 1035px) 33vw, (max-width: 1535px) 25vw, 20vw"
                      style={{
                        aspectRatio: "auto",
                      }}
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
