"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Trophy, Calendar, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Mock race data (same as in races page)
const MOCK_RACES = {
  "white-mountain-triathlon": {
    name: "White Mountain Triathlon 2025",
    date: "January 15, 2025",
    location: "White Mountains, NH",
    totalRunners: 1200,
    distance: "Sprint/Olympic",
    photoCount: 3500,
    startTime: "7:00 AM",
    category: "triathlon",
    description: "Experience the challenge of the White Mountains in this premier triathlon event featuring stunning scenery and challenging terrain.",
  },
  "busan-half-2024": {
    name: "Busan Half Marathon 2024",
    date: "April 21, 2024",
    location: "Busan, South Korea",
    totalRunners: 15000,
    distance: "21.0975 km",
    photoCount: 28500,
    startTime: "7:30 AM",
    category: "half-marathon",
    description: "Run along the beautiful coastline of Busan in this scenic half marathon event.",
  },
  "jeju-ultra-2024": {
    name: "Jeju Ultra Trail 2024",
    date: "May 11, 2024",
    location: "Jeju Island, South Korea",
    totalRunners: 5000,
    distance: "100 km",
    photoCount: 12000,
    startTime: "5:00 AM",
    category: "ultra",
    description: "Challenge yourself on the volcanic trails of Jeju Island in this ultimate endurance event.",
  },
  "incheon-10k-2024": {
    name: "Incheon 10K 2024",
    date: "June 8, 2024",
    location: "Incheon, South Korea",
    totalRunners: 8000,
    distance: "10 km",
    photoCount: 15000,
    startTime: "8:00 AM",
    category: "10k",
    description: "A fast and flat 10K course perfect for setting personal records.",
  },
  "daegu-marathon-2023": {
    name: "Daegu Marathon 2023",
    date: "November 5, 2023",
    location: "Daegu, South Korea",
    totalRunners: 20000,
    distance: "42.195 km",
    photoCount: 35000,
    startTime: "7:00 AM",
    category: "marathon",
    description: "Experience the autumn colors of Daegu in this IAAF Bronze Label marathon.",
  },
  "gwangju-trail-2023": {
    name: "Gwangju Trail Run 2023",
    date: "October 15, 2023",
    location: "Gwangju, South Korea",
    totalRunners: 3000,
    distance: "25 km",
    photoCount: 7500,
    startTime: "8:00 AM",
    category: "trail",
    description: "Navigate through the scenic mountain trails surrounding Gwangju.",
  },
};

export default function RaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const raceId = params?.race as string;
  const [bibNumber, setBibNumber] = useState("");

  const race = MOCK_RACES[raceId as keyof typeof MOCK_RACES];

  if (!race) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Race not found</h1>
        <Button onClick={() => router.push("/races")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Races
        </Button>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (bibNumber.trim()) {
      router.push(`/races/${raceId}/${bibNumber.trim()}`);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/races")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to All Races
      </Button>

      {/* Race Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{race.name}</h1>
            <p className="text-muted-foreground text-lg mb-4">
              {race.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                {race.category}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                {race.distance}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                {race.photoCount.toLocaleString()} photos
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Find Your Photos</h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your bib number"
                value={bibNumber}
                onChange={(e) => setBibNumber(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button 
              type="submit" 
              size="lg"
              disabled={!bibNumber.trim()}
              className="px-8"
            >
              Search Photos
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Race Information Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Date</h3>
            </div>
            <p className="text-muted-foreground">{race.date}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Location</h3>
            </div>
            <p className="text-muted-foreground">{race.location}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Participants</h3>
            </div>
            <p className="text-muted-foreground">{race.totalRunners.toLocaleString()} runners</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Start Time</h3>
            </div>
            <p className="text-muted-foreground">{race.startTime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-3xl font-bold text-primary">{race.photoCount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Photos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{race.totalRunners.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">Participants</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{race.distance}</p>
              <p className="text-sm text-muted-foreground mt-1">Distance</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground mt-1">Photos Processed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}