"use client";

import EventsGrid from "./_components/EventsGrid";
import { EVENTS } from "@/constants/data";

export default function EventsPage() {

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-foreground mb-4 text-4xl font-bold">Events</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Find your event photos from our available events.
        </p>
      </div>

      {/* Events Grid */}
      <div className="mx-auto max-w-sm tablet:max-w-4xl desktop:max-w-6xl">
        <EventsGrid events={EVENTS} />
      </div>
    </div>
  );
}