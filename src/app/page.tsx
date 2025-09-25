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
import { useOrganization } from "@/contexts/OrganizationContext";

export default function HomePage() {
  const [bibNumber, setBibNumber] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const router = useRouter();
  const { organization } = useOrganization();

  // Fetch events from API - filter by organization if available
  const eventsQuery = api.events.getAll.useQuery(
    organization?.organization_id
      ? { organizationId: organization.organization_id }
      : undefined,
  );

  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);

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
    <div className="flex min-h-[calc(100vh-64px)] flex-col">
      {/* Hero Section */}
      <section className="bg-background relative px-4 py-20 sm:py-32">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-foreground font-montserrat mb-6 text-4xl font-medium tracking-tight whitespace-pre-wrap sm:text-5xl md:text-6xl">
            {organization
              ? `${organization.name}\nEvent Photos`
              : "Find Your Event Photos"}
          </h1>

          <p className="text-muted-foreground mx-auto mb-16 max-w-xl text-lg">
            {organization?.custom_settings?.welcome_message ||
              "Enter your bib number to discover all your photos."}
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
                  disabled={events.length === 0}
                  className="bg-background border-border h-14 text-sm font-medium md:text-lg"
                  style={{
                    fontSize: "14px",
                  }}
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

      {/* Footer - Compact left/right layout */}
      <section className="bg-muted/10 mt-auto border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:py-4">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            {/* Left: legal */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-[10px] sm:text-xs">
              <Link
                href="/privacy-policy"
                className="hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="hidden sm:inline">•</span>
              <span>
                © {new Date().getFullYear()} {organization?.name || "SnapRace"}
                . All rights reserved.
              </span>
            </div>

            {/* Right: partners (optional) */}
            {organization?.custom_settings?.partners &&
            organization.custom_settings.partners.length > 0 ? (
              <div className="-mx-1 flex max-w-full items-center gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {organization.custom_settings.partners
                  .sort(
                    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
                  )
                  .map((partner) => (
                    <Link
                      key={partner.id}
                      href={partner.website_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <div className="relative h-6 w-20 sm:h-7 sm:w-24 md:h-8 md:w-28">
                        <Image
                          src={partner.logo_url}
                          alt={partner.name}
                          fill
                          className="object-contain opacity-70 transition-opacity hover:opacity-100"
                          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                        />
                      </div>
                    </Link>
                  ))}
              </div>
            ) : (
              (!organization ||
                organization?.custom_settings?.show_partner_section !==
                  false) && (
                <div className="-mx-1 flex max-w-full items-center gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {PARTNERS.filter(
                    (partner) => partner.name === "Millennium Running",
                  ).map((partner) => (
                    <Link
                      key={partner.name}
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <div className="relative h-6 w-20 sm:h-7 sm:w-24 md:h-8 md:w-28">
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          fill
                          className="object-contain opacity-70 transition-opacity hover:opacity-100"
                          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
