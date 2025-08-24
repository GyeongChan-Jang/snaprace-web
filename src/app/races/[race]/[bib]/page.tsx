"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoActions } from "@/components/photo-actions";
import { api } from "@/trpc/react";

// Mock race data (same as in main page for consistency)
const MOCK_RACES = {
  "white-mountain-triathlon": {
    name: "White Mountain Triathlon 2025",
    date: "January 15, 2025",
    location: "White Mountains, NH",
    totalRunners: 1200,
    distance: "Sprint/Olympic",
  },
  "busan-half-2024": {
    name: "Busan Half Marathon 2024",
    date: "April 21, 2024",
    location: "Busan, South Korea",
    totalRunners: 15000,
    distance: "21.0975 km",
  },
  "jeju-ultra-2024": {
    name: "Jeju Ultra Trail 2024",
    date: "May 11, 2024",
    location: "Jeju Island, South Korea",
    totalRunners: 5000,
    distance: "100 km",
  },
  "incheon-10k-2024": {
    name: "Incheon 10K 2024",
    date: "June 8, 2024",
    location: "Incheon, South Korea",
    totalRunners: 8000,
    distance: "10 km",
  },
  "daegu-marathon-2023": {
    name: "Daegu Marathon 2023",
    date: "November 5, 2023",
    location: "Daegu, South Korea",
    totalRunners: 20000,
    distance: "42.195 km",
  },
  "gwangju-trail-2023": {
    name: "Gwangju Trail Run 2023",
    date: "October 15, 2023",
    location: "Gwangju, South Korea",
    totalRunners: 3000,
    distance: "25 km",
  },
};

// Mock photo data
const generateMockPhotos = (bibNumber: string, raceId: string) => {
  const count = Math.floor(Math.random() * 6) + 4; // 4-9 photos
  return Array.from({ length: count }, (_, i) => ({
    id: `photo-${raceId}-${bibNumber}-${i + 1}`,
    url: `/samples/sample-${(i % 4) + 1}.jpg`,
    thumbnail: `/samples/sample-${(i % 4) + 1}.jpg`,
    timestamp: `${Math.floor(Math.random() * 4) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    location: ["Start Line", "5K Mark", "10K Mark", "Halfway", "Finish Line"][
      Math.floor(Math.random() * 5)
    ],
    photographer: `Photographer ${Math.floor(Math.random() * 10) + 1}`,
  }));
};

export default function RacePhotoPage() {
  const params = useParams();
  const router = useRouter();
  const race = params?.race as string;
  const bibNumber = params?.bib as string;

  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [activeTab, setActiveTab] = useState("photos");

  const raceInfo = MOCK_RACES[race as keyof typeof MOCK_RACES];

  // Fetch specific bib data from DynamoDB using tRPC
  const bibQuery = api.galleries.getById.useQuery(
    { bibNumber },
    {
      enabled: !!bibNumber,
    }
  );

  useEffect(() => {
    if (bibQuery.isSuccess) {
      if (bibQuery.data) {
        // Data found in DynamoDB
        console.log("Bib data found in DynamoDB:", bibQuery.data);
        
        // TODO: Transform DynamoDB data to match photo format
        // For now, still use mock photos but log the real data
        setPhotos(generateMockPhotos(bibNumber, race));
      } else {
        // No data found for this bib number
        console.log("No data found for bib number:", bibNumber);
        setPhotos([]); // Show empty state
      }
    } else if (bibQuery.isError) {
      // Error occurred, fallback to mock data
      console.error("Error fetching bib data:", bibQuery.error);
      setPhotos(generateMockPhotos(bibNumber, race));
    }
  }, [bibQuery.isSuccess, bibQuery.data, bibQuery.isError, bibQuery.error, bibNumber, race]);


  if (!raceInfo) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Race not found</h1>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              {raceInfo.name}
            </h1>
            <div className="text-muted-foreground flex flex-wrap gap-4">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Bib #{bibNumber}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {raceInfo.date}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {raceInfo.location}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              {raceInfo.distance}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              {bibQuery.isLoading 
                ? "Loading..." 
                : bibQuery.isError 
                  ? "Sample Photos" 
                  : `${photos.length} ${photos.length === 1 ? 'Photo' : 'Photos'}`
              }
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
          <TabsTrigger value="info">Race Info</TabsTrigger>
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
                <p className="text-yellow-600 mb-4">
                  ⚠️ Unable to connect to photo database
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Showing sample photos instead. Error: {bibQuery.error?.message}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => bibQuery.refetch()}
                >
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
                      src={photos[selectedPhoto].url}
                      alt={`Race photo ${selectedPhoto + 1}`}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="text-white">
                        <p className="font-semibold">
                          {photos[selectedPhoto].location}
                        </p>
                        <p className="text-sm opacity-90">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {photos[selectedPhoto].timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Photo Actions */}
              <PhotoActions
                photo={photos[selectedPhoto]}
                bibNumber={bibNumber}
              />

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
                      src={photo.thumbnail}
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
                <h3 className="text-lg font-semibold mb-2">No Photos Found</h3>
                <p className="text-muted-foreground mb-6">
                  {bibQuery.isSuccess && !bibQuery.data 
                    ? `No photos found for bib number #${bibNumber} in this race.`
                    : "We couldn't find any photos for this bib number."
                  }
                </p>
                <div className="flex flex-col gap-2 items-center">
                  <p className="text-sm text-muted-foreground">
                    Please check your bib number and try again
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/races/${race}`)}
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
              <h2 className="mb-6 text-2xl font-bold">Race Information</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 font-semibold">Event Name</h3>
                    <p className="text-muted-foreground">{raceInfo.name}</p>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Date</h3>
                    <p className="text-muted-foreground">{raceInfo.date}</p>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Location</h3>
                    <p className="text-muted-foreground">{raceInfo.location}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 font-semibold">Distance</h3>
                    <p className="text-muted-foreground">{raceInfo.distance}</p>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Total Participants</h3>
                    <p className="text-muted-foreground">
                      {raceInfo.totalRunners.toLocaleString()} runners
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
  );
}
