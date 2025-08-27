"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Trophy, Calendar, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EVENTS } from "@/constants/data";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.event as string;
  const [bibNumber, setBibNumber] = useState("");

  // Find the event from EVENTS array
  const event = EVENTS.find(e => e.id === eventId);

  if (!event) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <Button onClick={() => router.push("/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (bibNumber.trim()) {
      router.push(`/events/${eventId}/${bibNumber.trim()}`);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/events")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to All Events
      </Button>

      {/* Event Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                {event.type}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                {event.totalRunners.toLocaleString()} participants
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

      {/* Event Information Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Date</h3>
            </div>
            <p className="text-muted-foreground">{event.date.toLocaleDateString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Location</h3>
            </div>
            <p className="text-muted-foreground">{event.location}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Participants</h3>
            </div>
            <p className="text-muted-foreground">{event.totalRunners.toLocaleString()} runners</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}