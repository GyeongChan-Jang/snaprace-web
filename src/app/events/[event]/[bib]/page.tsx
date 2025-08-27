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

  const [searchBib, setSearchBib] = useState(bibNumber || "");
  const [columnCount, setColumnCount] = useState(4);
  const [uploadedSelfie, setUploadedSelfie] = useState<File | null>(null);
  const [isProcessingSelfie, setIsProcessingSelfie] = useState(false);
  const [selfieResults, setSelfieResults] = useState<string[]>([]);

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

  // const convertToBase64 = (file: File): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => {
  //       if (reader.result) {
  //         const base64String = (reader.result as string).split(",")[1];
  //         if (!base64String) {
  //           reject(new Error("Failed to extract base64 from result"));
  //           return;
  //         }
  //         resolve(base64String);
  //       } else {
  //         reject(new Error("Failed to convert file to base64"));
  //       }
  //     };
  //     reader.onerror = (error) => reject(new Error(`FileReader error: ${error}`));
  //   });
  // };

  // const callLambdaFunction = async (base64Image: string): Promise<string[]> => {
  //   try {
  //     const payload = {
  //       image: base64Image,
  //       bib_number: bibNumber ?? "",
  //       organizer_id: "snaprace", // Replace with actual organizer_id if available
  //       event_id: event,
  //     };

  //     const response = await fetch(
  //       "https://your-api-gateway-url.amazonaws.com/lambda_find_by_selfie",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(payload),
  //       },
  //     );

  //     if (!response.ok) {
  //       throw new Error(`Lambda call failed: ${response.status}`);
  //     }

  //     const result = (await response.json()) as { matched_photos?: string[] };
  //     return result.matched_photos ?? [];
  //   } catch (error) {
  //     console.error("Error calling Lambda function:", error);
  //     throw error;
  //   }
  // };

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    alert("not yet implemented");
    const file = e.target.files?.[0];
    if (file) {
      setUploadedSelfie(file);
      // TODO: Implement selfie processing when Lambda endpoint is ready
      console.log("Selfie uploaded:", file.name);
    }
  };

  const handleSelfieRemove = () => {
    setUploadedSelfie(null);
    setSelfieResults([]);
    setIsProcessingSelfie(false);
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
      const additionalSelfiePhotos =
        selfieResults.length > 0 ? selfieResults : [];
      const allPhotos = [
        ...bibPhotos,
        ...selfiePhotos,
        ...additionalSelfiePhotos,
      ];

      return allPhotos.map((url: string, index: number) => ({
        id: `photo-${event}-${bibNumber}-${index + 1}`,
        url,
        width: 300,
        height: 300, // Remove random height, let image determine its own size
      }));
    }
    return [];
  }, [
    isAllPhotos,
    allPhotosQuery.data,
    bibQuery.data,
    event,
    bibNumber,
    selfieResults,
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

            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 py-6">
        {/* Search and Selfie Upload Section */}
        <div className="mx-auto mb-12 max-w-4xl">
          {/* Bib Number Search */}
          <div className="mb-8 text-center">
            <h3 className="mb-4 text-xl font-medium">Find Your Race Photos</h3>
            <form
              onSubmit={handleBibSearch}
              className="mx-auto flex max-w-md items-center justify-center gap-3"
            >
              <Input
                type="text"
                placeholder="Enter bib number"
                value={searchBib}
                onChange={(e) => setSearchBib(e.target.value)}
                className="h-11 border-b border-gray-200 text-center"
              />
              <Button
                type="submit"
                disabled={!searchBib.trim()}
                className="h-11 px-6"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Selfie Upload Section */}
          <div className="text-center">
            <div className="mb-6">
              <h4 className="mb-2 text-lg font-medium">Upload Your Selfie</h4>
              <p className="text-muted-foreground mx-auto max-w-md text-sm">
                Upload a selfie to help us find more photos of you during the
                race using AI face matching
              </p>
            </div>

            {!uploadedSelfie ? (
              <label className="mx-auto block max-w-sm">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSelfieUpload}
                  className="hidden"
                  disabled={isProcessingSelfie}
                />
                <div className="border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/5 cursor-pointer rounded-lg border p-6 transition-all">
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="text-muted-foreground/60 h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">Click to upload</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        JPG, PNG or HEIC
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            ) : (
              <div className="mx-auto max-w-sm">
                <div className="bg-muted/20 flex items-center justify-between rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                      {isProcessingSelfie ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-b-transparent" />
                      ) : (
                        <svg
                          className="h-4 w-4 text-green-600"
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
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">
                        {uploadedSelfie.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {isProcessingSelfie
                          ? "Processing with AI..."
                          : `${(uploadedSelfie.size / 1024 / 1024).toFixed(1)} MB`}
                      </p>
                      {selfieResults.length > 0 && (
                        <p className="text-xs text-green-600">
                          Found {selfieResults.length} additional photos!
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelfieRemove}
                    className="text-xs"
                    disabled={isProcessingSelfie}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

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
                        {/* Share Button */}
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
                        {/* Download Button */}
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
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
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
