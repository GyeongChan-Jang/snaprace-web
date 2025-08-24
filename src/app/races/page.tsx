"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  ChevronDown,
  Grid,
  List,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for development using real sample images
const mockRaces = [
  {
    id: "1",
    name: "White Mountains Triathlon 2024",
    date: "2024-01-15",
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
  },
  {
    id: "2",
    name: "Boston Marathon 2024",
    date: "2024-04-15",
    location: "Boston, MA",
    participants: 26000,
    photoCount: 45000,
    thumbnails: [
      "/samples/sample-2.jpg",
      "/samples/sample-3.jpg",
      "/samples/sample-4.jpg",
      "/samples/sample-1.jpg",
    ],
    category: "marathon",
    status: "completed",
  },
  {
    id: "3",
    name: "Central Park 10K",
    date: "2024-03-20",
    location: "New York, NY",
    participants: 3500,
    photoCount: 8500,
    thumbnails: [
      "/samples/sample-3.jpg",
      "/samples/sample-4.jpg",
      "/samples/sample-1.jpg",
      "/samples/sample-2.jpg",
    ],
    category: "10k",
    status: "completed",
  },
  {
    id: "4",
    name: "Mountain Trail Challenge",
    date: "2024-05-10",
    location: "Colorado Springs, CO",
    participants: 800,
    photoCount: 2200,
    thumbnails: [
      "/samples/sample-4.jpg",
      "/samples/sample-1.jpg",
      "/samples/sample-2.jpg",
      "/samples/sample-3.jpg",
    ],
    category: "trail",
    status: "processing",
  },
];

const sampleImages = [
  "/samples/sample-1.jpg",
  "/samples/sample-2.jpg",
  "/samples/sample-3.jpg",
  "/samples/sample-4.jpg",
];

const allPhotos = Array.from({ length: 50 }, (_, i) => ({
  id: `photo-${i + 1}`,
  url: sampleImages[i % sampleImages.length],
  thumbnail: sampleImages[i % sampleImages.length],
  raceId: mockRaces[i % mockRaces.length]?.id ?? "1",
  raceName: mockRaces[i % mockRaces.length]?.name ?? "Race",
  bibNumber: Math.floor(Math.random() * 9999) + 1,
  location: [
    "Bike Course",
    "Run Course",
    "Swim Exit",
    "Transition",
    "Finish Line",
  ][Math.floor(Math.random() * 5)],
  timestamp: new Date(
    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
  ).toISOString(),
}));

export default function RacesPage() {
  const [races, setRaces] = useState(mockRaces);
  const [allPhotosData, setAllPhotosData] = useState(allPhotos);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"races" | "photos">("races");
  const [gridView, setGridView] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Infinite scroll state
  const [displayedPhotos, setDisplayedPhotos] = useState(
    allPhotos.slice(0, 12),
  );
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const loadMorePhotos = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    setTimeout(() => {
      const currentLength = displayedPhotos.length;
      const nextPhotos = allPhotos.slice(currentLength, currentLength + 12);

      if (nextPhotos.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedPhotos((prev) => [...prev, ...nextPhotos]);
      }

      setLoadingMore(false);
    }, 500);
  }, [displayedPhotos.length, loadingMore, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (viewMode !== "photos") return;

      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        loadMorePhotos();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMorePhotos, viewMode]);

  const filteredRaces = races.filter((race) => {
    const matchesSearch =
      race.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      race.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || race.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredPhotos = allPhotosData.filter((photo) => {
    const race = races.find((r) => r.id === photo.raceId);
    const matchesSearch =
      race?.name.toLowerCase().includes(searchTerm.toLowerCase()) ??
      race?.location.toLowerCase().includes(searchTerm.toLowerCase()) ??
      photo.bibNumber.toString().includes(searchTerm);
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="mb-4 h-12 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="mb-6 flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-4 text-4xl font-bold">
          Browse Race Photos
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Explore photos from all race events. Find your race or browse through
          thousands of action shots.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8 space-y-4">
        {/* Search and View Toggle */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex max-w-md flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search races, locations, or bib numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "races" ? "default" : "outline"}
              onClick={() => setViewMode("races")}
              size="sm"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Races
            </Button>
            <Button
              variant={viewMode === "photos" ? "default" : "outline"}
              onClick={() => setViewMode("photos")}
              size="sm"
            >
              <Grid className="mr-2 h-4 w-4" />
              All Photos
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="text-muted-foreground h-4 w-4" />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="marathon">Marathon</SelectItem>
                <SelectItem value="triathlon">Triathlon</SelectItem>
                <SelectItem value="10k">10K</SelectItem>
                <SelectItem value="trail">Trail Run</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="participants">Participants</SelectItem>
              <SelectItem value="photos">Photo Count</SelectItem>
            </SelectContent>
          </Select>

          {viewMode === "photos" && (
            <div className="ml-auto flex gap-2">
              <Button
                variant={gridView === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setGridView("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={gridView === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setGridView("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === "races" ? (
        // Race Cards View
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRaces.map((race) => (
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

                  <div className="flex items-center justify-between">
                    <span className="text-foreground text-sm font-medium">
                      {race.photoCount.toLocaleString()} photos
                    </span>
                    <Link href={`/races/${race.id}`}>
                      <Button size="sm">View Photos</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // All Photos View
        <div>
          {gridView === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayedPhotos.map((photo) => (
                <Card
                  key={photo.id}
                  className="group overflow-hidden border-0 shadow-sm transition-all duration-200 hover:shadow-lg"
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={photo.thumbnail ?? ""}
                        alt={`Photo from ${photo.raceName}`}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <div className="absolute right-0 bottom-0 left-0 p-3 text-white">
                          <p className="truncate text-sm font-medium">
                            {photo.raceName}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span>Bib #{photo.bibNumber}</span>
                            <span>{photo.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden py-0">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={photo.thumbnail ?? ""}
                          alt={`Photo from ${photo.raceName}`}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <h4 className="text-foreground font-medium">
                          {photo.raceName}
                        </h4>
                        <div className="text-muted-foreground flex items-center gap-4 text-sm">
                          <span>Bib #{photo.bibNumber}</span>
                          <span>{photo.location}</span>
                          <span>
                            {new Date(photo.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Link href={`/bib/${photo.bibNumber}`}>
                        <Button size="sm" variant="outline">
                          View All Photos
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {loadingMore && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          )}

          {!hasMore && displayedPhotos.length > 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {`You've seen all photos!`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {((viewMode === "races" && filteredRaces.length === 0) ||
        (viewMode === "photos" && filteredPhotos.length === 0)) && (
        <div className="py-16 text-center">
          <div className="mb-4">
            <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <Search className="text-muted-foreground h-8 w-8" />
            </div>
          </div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            No results found
          </h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search terms or filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
