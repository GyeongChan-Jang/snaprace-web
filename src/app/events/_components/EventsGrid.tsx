"use client";

import EventCard from "./EventCard";

interface Event {
  id: string;
  name: string;
  image: string;
  date: Date;
}

interface EventsGridProps {
  events: Event[];
}

export default function EventsGrid({ events }: EventsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3 tablet:gap-8 desktop:gap-10">
      {events.map((event) => (
        <EventCard
          key={event.id}
          id={event.id}
          name={event.name}
          image={event.image}
          date={event.date}
        />
      ))}
    </div>
  );
}