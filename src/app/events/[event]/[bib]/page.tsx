"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhotoActions } from "@/components/photo-actions";
import { api } from "@/trpc/react";
import { PARTNERS } from "@/constants/data";
import {
  PhotoGridSkeleton,
  EventHeaderSkeleton,
} from "@/components/states/EventsSkeleton";
import { ErrorState } from "@/components/states/ErrorState";
import { NoPhotosState } from "@/components/states/EmptyState";

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  timestamp: string;
  location: string;
  photographer: string;
}

export default function EventPhotoPage() {
  const params = useParams();
  const router = useRouter();
  const event = params?.event as string;
  const bibParam = params?.bib as string;
  const isAllPhotos = bibParam === "null";
  const bibNumber = isAllPhotos ? "" : bibParam;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [searchBib, setSearchBib] = useState("");

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

  // Mock all photos data when bib is null
  const allPhotosData = isAllPhotos
    ? [
        {
          id: "all-photo-1",
          url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
          thumbnail:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
          timestamp: "2025-06-15T08:30:00Z",
          location: "Start Line",
          photographer: "Event Photographer",
        },
        {
          id: "all-photo-2",
          url: "https://images.unsplash.com/photo-1544717440-6a5d6efd7e44?w=800&h=600&fit=crop",
          thumbnail:
            "https://images.unsplash.com/photo-1544717440-6a5d6efd7e44?w=300&h=200&fit=crop",
          timestamp: "2025-06-15T09:45:00Z",
          location: "Mile 5",
          photographer: "Event Photographer",
        },
        {
          id: "all-photo-3",
          url: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop",
          thumbnail:
            "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&h=200&fit=crop",
          timestamp: "2025-06-15T10:15:00Z",
          location: "Finish Line",
          photographer: "Event Photographer",
        },
      ]
    : [];

  // Set photos based on whether we're showing all photos or specific bib
  useEffect(() => {
    if (isAllPhotos) {
      setPhotos(allPhotosData);
    }
  }, [isAllPhotos]);

  const eventInfo = eventQuery.data;

  if (eventQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <EventHeaderSkeleton />
        <PhotoGridSkeleton />
      </div>
    );
  }

  if (eventQuery.error || !eventInfo) {
    return (
      <>
        <div className="container mx-auto py-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Event not found</h1>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Footer Partners Section - Full Width */}
        <footer className="bg-muted/30 w-full border-t">
          <div className="py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 text-center">
                <h2 className="text-foreground mb-2 text-xl font-bold tracking-tight">
                  Photo Partners
                </h2>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                {PARTNERS.map((partner) => (
                  <Link
                    key={partner.name}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center transition-all hover:scale-105"
                  >
                    <div className="relative h-10 w-24 md:h-12 md:w-32">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        fill
                        className="object-contain opacity-60 transition-opacity group-hover:opacity-100"
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="mb-8 text-center">
            <h1 className="text-foreground mb-2 text-4xl font-bold">
              {eventInfo.event_name}
            </h1>
            <div className="text-muted-foreground flex flex-wrap justify-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(eventInfo.event_date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {eventInfo.event_location}
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                {eventInfo.event_type}
              </span>
            </div>
          </div>

          {/* Bib Search Section */}
          <div className="mx-auto mb-8 max-w-md">
            <form onSubmit={handleBibSearch} className="relative">
              <Input
                type="text"
                placeholder="Enter your bib number to find your photos"
                value={searchBib}
                onChange={(e) => setSearchBib(e.target.value)}
                className="bg-background border-border h-12 pr-12 text-center"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute top-1 right-1 h-10 px-3"
                disabled={!searchBib.trim()}
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            {!isAllPhotos && (
              <p className="text-muted-foreground mt-2 text-center text-sm">
                Currently showing photos for bib #{bibNumber}
              </p>
            )}
            {isAllPhotos && (
              <p className="text-muted-foreground mt-2 text-center text-sm">
                Showing all event photos
              </p>
            )}
          </div>
        </div>

        {/* Photos Section */}
        <div className="space-y-6">
          {!isAllPhotos && bibQuery.isLoading ? (
            <PhotoGridSkeleton />
          ) : !isAllPhotos && bibQuery.isError ? (
            <ErrorState
              title="Unable to load photos"
              message={`There was an error loading photos for this bib number: ${bibQuery.error?.message}`}
              onRetry={() => bibQuery.refetch()}
            />
          ) : photos.length > 0 ? (
            <>
              {/* Photo Count */}
              <div className="mb-6 text-center">
                <p className="text-muted-foreground text-sm">
                  {photos.length} {photos.length === 1 ? "Photo" : "Photos"}{" "}
                  Found
                  {!isAllPhotos && ` for Bib #${bibNumber}`}
                </p>
              </div>

              {/* Main Photo Display */}
              <div className="mx-auto max-w-4xl">
                <div className="bg-muted relative mb-6 aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={photos[selectedPhoto]?.url ?? ""}
                    alt={`Photo ${selectedPhoto + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="text-white">
                      <p className="font-medium">
                        {photos[selectedPhoto]?.location ?? ""}
                      </p>
                      <p className="text-sm opacity-90">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {photos[selectedPhoto]?.timestamp ?? ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Photo Actions */}
                {photos[selectedPhoto] && !isAllPhotos && (
                  <div className="mb-6">
                    <PhotoActions
                      photo={photos[selectedPhoto]}
                      bibNumber={bibNumber}
                    />
                  </div>
                )}

                {/* Photo Grid/Thumbnails */}
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhoto(index)}
                      className={`relative aspect-square overflow-hidden rounded transition-all ${
                        selectedPhoto === index
                          ? "ring-primary ring-2"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={photo?.thumbnail ?? ""}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </>
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

      {/* Footer Partners Section - Full Width */}
      <footer className="bg-muted/30 w-full border-t">
        <div className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 text-center">
              <h2 className="text-foreground mb-2 text-xl font-bold tracking-tight">
                Partners & Sponsors
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              {PARTNERS.map((partner) => (
                <Link
                  key={partner.name}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center transition-all hover:scale-105"
                >
                  <div className="relative h-10 w-24 md:h-12 md:w-32">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain opacity-60 transition-opacity group-hover:opacity-100"
                      sizes="(max-width: 768px) 96px, 128px"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
