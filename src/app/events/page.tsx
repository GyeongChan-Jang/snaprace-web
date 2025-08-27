"use client";

import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/constants/data";

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-4 text-4xl font-bold">Events</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Find your event photos from our current available event.
        </p>
      </div>

      {/* Single Event Card */}
      <div className="mx-auto max-w-md">
        <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg">
          <CardContent className="p-6">
            {/* Event Title */}
            <div className="mb-6 text-center">
              <h3 className="text-foreground mb-2 text-2xl font-bold">
                {EVENT.fullName}
              </h3>
              <Badge variant="default" className="px-3 py-1">
                Available Now
              </Badge>
            </div>

            {/* Event Details */}
            <div className="mb-6 space-y-3">
              <div className="text-muted-foreground flex items-center text-sm">
                <Calendar className="mr-3 h-4 w-4" />
                {EVENT.date}
              </div>
              <div className="text-muted-foreground flex items-center text-sm">
                <MapPin className="mr-3 h-4 w-4" />
                {EVENT.location}
              </div>
              <div className="text-muted-foreground flex items-center text-sm">
                <Users className="mr-3 h-4 w-4" />
                {EVENT.totalRunners.toLocaleString()} participants
              </div>
            </div>

            {/* Event Distance */}
            <div className="mb-6 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Distance:</span>
                <span className="text-sm font-medium">{EVENT.distance}</span>
              </div>
            </div>

            {/* Action Button */}
            <Link href={`/events/${EVENT.id}`} className="block">
              <Button className="w-full" size="lg">
                Find My Photos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
