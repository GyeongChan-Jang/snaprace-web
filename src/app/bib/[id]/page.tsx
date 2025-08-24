"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Download,
  Share2,
  ChevronLeft,
  Grid,
  List,
  Filter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";

// Mock data for development using real sample images
const mockPhotos = [
  {
    id: "1",
    url: "/samples/sample-1.jpg",
    thumbnail: "/samples/sample-1.jpg",
    timestamp: "2024-01-15T10:30:00Z",
    location: "Run Course - Mile 10",
    photographer: "Millennium Running Photos",
  },
  {
    id: "2",
    url: "/samples/sample-2.jpg",
    thumbnail: "/samples/sample-2.jpg",
    timestamp: "2024-01-15T11:45:00Z",
    location: "Run Course - Mile 10",
    photographer: "White Mountains Photography",
  },
  {
    id: "3",
    url: "/samples/sample-3.jpg",
    thumbnail: "/samples/sample-3.jpg",
    timestamp: "2024-01-15T12:15:00Z",
    location: "Finish Line - Mile 10",
    photographer: "Triathlon Action Shots",
  },
  {
    id: "4",
    url: "/samples/sample-4.jpg",
    thumbnail: "/samples/sample-4.jpg",
    timestamp: "2024-01-15T12:20:00Z",
    location: "Finish Line - Mile 10",
    photographer: "Event Photography",
  },
];

export default function BibNumberPage() {
  const params = useParams();
  const bibId = params.id as string;
  const [photos] = useState(mockPhotos);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("time");

  const gallery = api.galleries.getAll.useQuery({});
  console.log("gallery", gallery.data);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [bibId]);


  const handleDownload = async (photoUrl: string, photoId: string) => {
    // In production, this would download from your API
    const link = document.createElement("a");
    link.href = photoUrl;
    link.download = `race-photo-bib-${bibId}-${photoId}.jpg`;
    link.click();
  };

  const handleShare = async (_photoUrl: string, photoId: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Race Photo - Bib #${bibId}`,
          text: `Check out my race photo from today's event!`,
          url: window.location.href + `#photo-${photoId}`,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback for browsers without native sharing
      await navigator.clipboard.writeText(
        window.location.href + `#photo-${photoId}`,
      );
      alert("Photo link copied to clipboard!");
    }
  };

  const sortedPhotos = [...photos].sort((a, b) => {
    switch (sortBy) {
      case "time":
        return (
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      case "location":
        return a.location.localeCompare(b.location);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-32" />
          <Skeleton className="mb-4 h-12 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Controls Skeleton */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Photo Grid Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center text-sm"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Search
        </Link>

        <div className="mb-4 flex items-center gap-4">
          <h1 className="text-foreground text-3xl font-bold">Bib #{bibId}</h1>
          <Badge variant="secondary" className="text-sm">
            {photos.length} photos found
          </Badge>
        </div>

        <p className="text-muted-foreground">
          All photos featuring bib number {bibId} from this race event
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="mr-2 h-4 w-4" />
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="mr-2 h-4 w-4" />
            List
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Photo Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedPhotos.map((photo) => (
            <Card
              key={photo.id}
              className="group overflow-hidden border-0 shadow-sm transition-all duration-200 hover:shadow-lg"
            >
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={photo.thumbnail}
                    alt={`Race photo from ${photo.location}`}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20">
                    <div className="absolute top-2 right-2 space-y-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownload(photo.url, photo.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => handleShare(photo.url, photo.id)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Photo Info Overlay */}
                  <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <div className="flex items-center justify-between text-sm text-white">
                      <span className="font-medium">{photo.location}</span>
                      {/* <Button
                        size="sm"
                        variant="ghost"
                        className={`h-6 p-0 text-white hover:text-red-400 ${photo.isLiked ? 'text-red-400' : ''}`}
                        onClick={() => handleLike(photo.id)}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${photo.isLiked ? 'fill-current' : ''}`} />
                        {photo.likes}
                      </Button> */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {sortedPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden py-0">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={photo.thumbnail}
                      alt={`Race photo from ${photo.location}`}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-foreground text-sm font-semibold md:text-base">
                        {photo.location}
                      </h3>
                      <Badge
                        variant="outline"
                        className="hidden text-xs md:block"
                      >
                        {new Date(photo.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground text-xs md:text-base">
                      By {photo.photographer}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* <Button
                        size="sm"
                        variant="ghost"
                        className={`h-auto p-0 ${photo.isLiked ? "text-red-400" : "text-muted-foreground"}`}
                        onClick={() => handleLike(photo.id)}
                      >
                        <Heart
                          className={`mr-1 h-4 w-4 ${photo.isLiked ? "fill-current" : ""}`}
                        />
                        {photo.likes}
                      </Button> */}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(photo.url, photo.id)}
                        >
                          <Download className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:block">Download</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShare(photo.url, photo.id)}
                        >
                          <Share2 className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:block">Share</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && !loading && (
        <div className="py-16 text-center">
          <div className="mb-4">
            <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <Grid className="text-muted-foreground h-8 w-8" />
            </div>
          </div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            No photos found
          </h3>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find any photos for bib #{bibId}. The photos might
            not have been processed yet.
          </p>
          <Link href="/">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Try Another Bib Number
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
