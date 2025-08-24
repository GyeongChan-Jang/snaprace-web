"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for development using real sample images
const mockRaces = [
  {
    id: "white-mountain-triathlon",
    name: "White Mountain Triathlon 2025",
    date: "2025-01-15",
    location: "White Mountains, NH",
    participants: 1200,
    photoCount: 3500,
    thumbnails: [
      "/samples/sample-1.jpg",
      "/samples/sample-2.jpg",
      "/samples/sample-3.jpg",
      "/samples/sample-4.jpg",
    ],
    category: "triathlon",
    status: "completed",
    distance: "Sprint/Olympic",
  },
  {
    id: "busan-half-2024",
    name: "Busan Half Marathon 2024",
    date: "2024-04-21",
    location: "Busan, South Korea",
    participants: 15000,
    photoCount: 28500,
    thumbnails: [
      "/samples/sample-2.jpg",
      "/samples/sample-3.jpg",
      "/samples/sample-4.jpg",
      "/samples/sample-1.jpg",
    ],
    category: "half-marathon",
    status: "completed",
    distance: "21.0975 km",
  },
  {
    id: "jeju-ultra-2024",
    name: "Jeju Ultra Trail 2024",
    date: "2024-05-11",
    location: "Jeju Island, South Korea",
    participants: 5000,
    photoCount: 12000,
    thumbnails: [
      "/samples/sample-3.jpg",
      "/samples/sample-4.jpg",
      "/samples/sample-1.jpg",
      "/samples/sample-2.jpg",
    ],
    category: "ultra",
    status: "completed",
    distance: "100 km",
  },
  {
    id: "incheon-10k-2024",
    name: "Incheon 10K 2024",
    date: "2024-06-08",
    location: "Incheon, South Korea",
    participants: 8000,
    photoCount: 15000,
    thumbnails: [
      "/samples/sample-4.jpg",
      "/samples/sample-1.jpg",
      "/samples/sample-2.jpg",
      "/samples/sample-3.jpg",
    ],
    category: "10k",
    status: "processing",
    distance: "10 km",
  },
  {
    id: "daegu-marathon-2023",
    name: "Daegu Marathon 2023",
    date: "2023-11-05",
    location: "Daegu, South Korea",
    participants: 20000,
    photoCount: 35000,
    thumbnails: [
      "/samples/sample-1.jpg",
      "/samples/sample-3.jpg",
      "/samples/sample-2.jpg",
      "/samples/sample-4.jpg",
    ],
    category: "marathon",
    status: "completed",
    distance: "42.195 km",
  },
  {
    id: "gwangju-trail-2023",
    name: "Gwangju Trail Run 2023",
    date: "2023-10-15",
    location: "Gwangju, South Korea",
    participants: 3000,
    photoCount: 7500,
    thumbnails: [
      "/samples/sample-2.jpg",
      "/samples/sample-4.jpg",
      "/samples/sample-3.jpg",
      "/samples/sample-1.jpg",
    ],
    category: "trail",
    status: "completed",
    distance: "25 km",
  },
];

export default function RacesPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="mb-4 h-12 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-4 text-4xl font-bold">
          All Race Events
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Browse through all available race events and find your photos.
        </p>
      </div>

      {/* Race Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockRaces.map((race) => (
          <Card
            key={race.id}
            className="group overflow-hidden transition-all duration-200 hover:shadow-lg"
          >
            <CardContent className="p-0">
              {/* Photo Preview Grid */}
              <div className="grid aspect-[4/3] grid-cols-2 gap-1 overflow-hidden">
                {race.thumbnails.map((thumb, idx) => (
                  <div key={idx} className="relative overflow-hidden">
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                ))}
              </div>

              <div className="p-6">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-foreground line-clamp-2 flex-1 text-lg font-semibold">
                    {race.name}
                  </h3>
                  <Badge
                    variant={
                      race.status === "completed" ? "default" : "secondary"
                    }
                    className="ml-2"
                  >
                    {race.status}
                  </Badge>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="text-muted-foreground flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(race.date).toLocaleDateString()}
                  </div>
                  <div className="text-muted-foreground flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4" />
                    {race.location}
                  </div>
                  <div className="text-muted-foreground flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4" />
                    {race.participants.toLocaleString()} participants
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Distance:</span>
                      <span className="font-medium">{race.distance}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground text-sm font-medium">
                      {race.photoCount.toLocaleString()} photos
                    </span>
                    <Link href={`/races/${race.id}`}>
                      <Button size="sm">View Race</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
