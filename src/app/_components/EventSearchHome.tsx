"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { EventSelectSkeleton } from "@/components/states/EventsSkeleton";
import { useOrganizationHelper } from "@/hooks/useOrganizationHelper";
import { api } from "@/trpc/react";
import { Footer } from "@/components/Footer";

export function EventSearchHome() {
  const [bibNumber, setBibNumber] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const router = useRouter();
  const org = useOrganizationHelper();

  const eventsQuery = api.events.getAll.useQuery();
  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0]?.event_id ?? "");
    }
  }, [events, selectedEventId]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (bibNumber.trim() && selectedEventId) {
      router.push(`/events/${selectedEventId}/${bibNumber.trim()}`);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col">
      <section className="bg-background relative px-4 py-20 sm:py-32">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-foreground mb-6 text-3xl font-medium tracking-tight whitespace-pre-wrap sm:text-4xl md:text-5xl">
            {org.subdomain
              ? `${org.name}\nEvent Photos`
              : "Find Your Event Photos"}
          </h1>

          <p className="text-muted-foreground mx-auto mb-16 max-w-xl text-lg">
            {org.welcomeMessage}
          </p>

          <div className="mx-auto max-w-xl">
            <form onSubmit={handleSearch} className="space-y-4">
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
                    <SelectTrigger
                      disabled={events.length === 0}
                      className="bg-background border-border !h-14 w-full text-sm font-medium"
                    >
                      <SelectValue
                        placeholder={
                          events.length === 0
                            ? "No events available"
                            : "Select an event"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {events.length > 0 &&
                        events.map((event) => (
                          <SelectItem
                            key={event.event_id}
                            value={event.event_id}
                            className="!h-14"
                          >
                            {event.event_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                  <Search className="h-4 w-4" />
                  Bib Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter your bib number (e.g., 1234)"
                  value={bibNumber}
                  onChange={(event) => setBibNumber(event.target.value)}
                  disabled={events.length === 0}
                  className="bg-background border-border h-14 text-sm font-medium md:text-lg"
                  style={{ fontSize: "14px" }}
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

      <Footer />
    </div>
  );
}
