"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PARTNERS } from "@/constants/data";
import { api } from "@/trpc/react";
import { EventSelectSkeleton } from "@/components/states/EventsSkeleton";

export default function HomePage() {
  const [bibNumber, setBibNumber] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const router = useRouter();

  // Fetch events from API
  const eventsQuery = api.events.getAll.useQuery();

  // Set default event when data loads
  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);

  console.log("events", events);

  // Update selectedEventId when events are loaded and no event is selected
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0]?.event_id ?? "");
    }
  }, [events, selectedEventId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (bibNumber.trim() && selectedEventId) {
      router.push(`/events/${selectedEventId}/${bibNumber.trim()}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background relative px-4 py-20 sm:py-32">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-foreground font-montserrat mb-6 text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl">
            Find Your Event Photos
          </h1>

          <p className="text-muted-foreground mx-auto mb-16 max-w-xl text-lg">
            Enter your bib number to discover all your photos.
          </p>

          {/* Main Search */}
          <div className="mx-auto max-w-xl">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Event Selection */}
              {eventsQuery.isLoading ? (
                <EventSelectSkeleton />
              ) : (
                <div className="space-y-2">
                  <label className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <Trophy className="h-4 w-4" />
                    Event
                  </label>
                  <Select
                    value={selectedEventId}
                    onValueChange={setSelectedEventId}
                  >
                    <SelectTrigger className="bg-background border-border !h-14 w-full text-sm font-medium">
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.length > 0 ? (
                        events.map((event) => (
                          <SelectItem
                            key={event.event_id}
                            value={event.event_id}
                            className="!h-14"
                          >
                            {event.event_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No events available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Bib Number Input */}
              <div className="space-y-2">
                <label className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                  <Search className="h-4 w-4" />
                  Bib Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter your bib number (e.g., 1234)"
                  value={bibNumber}
                  onChange={(e) => setBibNumber(e.target.value)}
                  className="bg-background border-border h-14 text-lg font-medium"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 w-full border-0 text-lg font-medium shadow-none"
                disabled={!bibNumber.trim() || !selectedEventId}
              >
                <Search className="mr-2 h-5 w-5" />
                Find My Photos
              </Button>
            </form>
          </div>

          <p className="text-muted-foreground mt-4 text-sm">
            Don&apos;t know your bib number?{" "}
            <Link href="/events" className="text-primary hover:underline">
              Browse all events
            </Link>
          </p>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="px-4 py-16 sm:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-montserrat">
              Why Choose SnapRace?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              The fastest and easiest way to find and share your race memories
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="group border-0 bg-background shadow-sm transition-all hover:shadow-lg hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* How It Works Section */}
      {/* <section className="bg-muted/30 px-4 py-16 sm:py-24">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-montserrat">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Three simple steps to find your perfect race moments
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Enter Bib Number",
                description: "Type in your race bib number in the search box above",
              },
              {
                step: "02", 
                title: "Browse Your Photos",
                description: "Our AI instantly finds all photos featuring your bib number",
              },
              {
                step: "03",
                title: "Download & Share", 
                description: "Download high-resolution photos or share directly to social media",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="px-4 py-16">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground font-montserrat">
            Ready to Find Your Photos?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of runners who trust SnapRace to capture their best moments
          </p>
          <Button size="lg" className="h-12 px-8 text-lg font-medium" onClick={() => {
            document.querySelector('input')?.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}>
            <Search className="mr-2 h-5 w-5" />
            Start Searching Now
          </Button>
        </div>
      </section> */}

      {/* Partners Section */}
      <section className="bg-muted/30 border-t px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-foreground mb-4 text-2xl font-bold tracking-tight">
              Partners & Sponsors
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              Trusted by leading event organizers and photography partners
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {PARTNERS.map((partner) => (
              <Link
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center transition-all hover:scale-105"
              >
                <div className="relative h-12 w-32 md:h-16 md:w-40">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain opacity-70 transition-opacity group-hover:opacity-100"
                    sizes="(max-width: 768px) 128px, 160px"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
