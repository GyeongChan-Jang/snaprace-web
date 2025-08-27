"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trophy, Calendar, MapPin, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoActions } from "@/components/photo-actions";
import { api } from "@/trpc/react";
import { EVENT, PARTNERS } from "@/constants/data";

// Photo type definition
interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  timestamp: string;
  location: string;
  photographer: string;
}

// DynamoDB data interface
interface GalleryData {
  event_id: string;
  bib_number: string;
  bib_matched_photos?: string[];
  event_date?: string;
  event_name?: string;
  last_updated?: string;
  organizer_id?: string;
  runner_name?: string;
  selfie_enhanced?: boolean;
  selfie_matched_photos?: string[];
}

export default function EventPhotoPage() {
  const params = useParams();
  const router = useRouter();
  const event = params?.event as string;
  const bibNumber = params?.bib as string;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [activeTab, setActiveTab] = useState("photos");

  const eventInfo = event === EVENT.id ? EVENT : null;

  // Fetch specific bib data from DynamoDB using tRPC
  const bibQuery = api.galleries.get.useQuery(
    { eventId: event, bibNumber },
    {
      enabled: !!bibNumber && !!event,
    },
  );

  // useEffect(() => {
  //   if (bibQuery.isSuccess) {
  //     if (bibQuery.data) {
  //       // Data found in DynamoDB
  //       console.log("Bib data found in DynamoDB:", bibQuery.data);

  //       // Transform DynamoDB data to Photo format
  //       const dynamoData = bibQuery.data as GalleryData;

  //       // Combine bib matched photos and selfie matched photos
  //       const bibPhotos = dynamoData.bib_matched_photos ?? [];
  //       const selfiePhotos = dynamoData.selfie_matched_photos ?? [];
  //       const allPhotos = [...bibPhotos, ...selfiePhotos];

  //       if (allPhotos.length > 0) {
  //         const transformedPhotos: Photo[] = allPhotos.map(
  //           (url: string, index: number) => {
  //             const isSelfie = index >= bibPhotos.length;
  //             return {
  //               id: `photo-${event}-${bibNumber}-${index + 1}`,
  //               url,
  //               thumbnail: url,
  //               timestamp: dynamoData.event_date ?? "Unknown Time",
  //               location: isSelfie
  //                 ? "Selfie"
  //                 : index === 0
  //                   ? "Start Line"
  //                   : index === bibPhotos.length - 1
  //                     ? "Finish Line"
  //                     : `Mile ${index + 1}`,
  //               photographer: dynamoData.organizer_id ?? "Unknown Photographer",
  //             };
  //           },
  //         );
  //         setPhotos(transformedPhotos);
  //       } else {
  //         setPhotos([]); // No photos available
  //       }
  //     } else {
  //       // No data found for this bib number
  //       console.log("No data found for bib number:", bibNumber);
  //       setPhotos([]); // Show empty state
  //     }
  //   } else if (bibQuery.isError) {
  //     console.error("Error fetching bib data:", bibQuery.error);
  //   }
  // }, [
  //   bibQuery.isSuccess,
  //   bibQuery.data,
  //   bibQuery.isError,
  //   bibQuery.error,
  //   bibNumber,
  //   race,
  // ]);

  if (!eventInfo) {
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
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold">
                <Trophy className="text-primary h-8 w-8" />
                {eventInfo.fullName}
              </h1>
              <div className="text-muted-foreground flex flex-wrap gap-4">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Bib #{bibNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {eventInfo.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {eventInfo.location}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {eventInfo.distance}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                {bibQuery.isLoading
                  ? "Loading..."
                  : bibQuery.isError
                    ? "Sample Photos"
                    : `${photos.length} ${photos.length === 1 ? "Photo" : "Photos"}`}
              </Badge>
              {bibQuery.isSuccess && bibQuery.data && (
                <Badge variant="default" className="px-3 py-1">
                  ✓ Found in DB
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="info">Event Info</TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="space-y-6">
            {bibQuery.isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    Searching for your photos...
                  </p>
                  <div className="flex animate-pulse justify-center gap-2">
                    <div className="bg-primary h-2 w-2 rounded-full"></div>
                    <div className="bg-primary h-2 w-2 rounded-full delay-75"></div>
                    <div className="bg-primary h-2 w-2 rounded-full delay-150"></div>
                  </div>
                </CardContent>
              </Card>
            ) : bibQuery.isError ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="mb-4 text-yellow-600">
                    ⚠️ Unable to connect to photo database
                  </p>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Showing sample photos instead. Error:{" "}
                    {bibQuery.error?.message}
                  </p>
                  <Button variant="outline" onClick={() => bibQuery.refetch()}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : photos.length > 0 ? (
              <>
                {/* Main Photo Display */}
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-muted relative aspect-[4/3]">
                      <Image
                        src={photos[selectedPhoto]?.url ?? ""}
                        alt={`Race photo ${selectedPhoto + 1}`}
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <div className="text-white">
                          <p className="font-semibold">
                            {photos[selectedPhoto]?.location ?? ""}
                          </p>
                          <p className="text-sm opacity-90">
                            <Clock className="mr-1 inline h-3 w-3" />
                            {photos[selectedPhoto]?.timestamp ?? ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Photo Actions */}
                {photos[selectedPhoto] && (
                  <PhotoActions
                    photo={photos[selectedPhoto]}
                    bibNumber={bibNumber}
                  />
                )}

                {/* Photo Thumbnails */}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhoto(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        selectedPhoto === index
                          ? "border-primary ring-primary/20 ring-2"
                          : "hover:border-muted-foreground/50 border-transparent"
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
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="mb-4">
                    <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                      <User className="text-muted-foreground h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    No Photos Found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {bibQuery.isSuccess && !bibQuery.data
                      ? `No photos found for bib number #${bibNumber} in this race.`
                      : "We couldn't find any photos for this bib number."}
                  </p>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-muted-foreground text-sm">
                      Please check your bib number and try again
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/events/${event}`)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Search Another Bib
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="info">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-6 text-2xl font-bold">Event Information</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-1 font-semibold">Event Name</h3>
                      <p className="text-muted-foreground">
                        {eventInfo.fullName}
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Date</h3>
                      <p className="text-muted-foreground">{eventInfo.date}</p>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Location</h3>
                      <p className="text-muted-foreground">
                        {eventInfo.location}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-1 font-semibold">Distance</h3>
                      <p className="text-muted-foreground">
                        {eventInfo.distance}
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Total Participants</h3>
                      <p className="text-muted-foreground">
                        {eventInfo.totalRunners.toLocaleString()} runners
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Your Bib Number</h3>
                      <p className="text-muted-foreground">#{bibNumber}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
