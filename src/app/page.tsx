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
import { SocialIcon } from "react-social-icons";

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

  // Set default event when data loads
  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);

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

      {/* Partners Section (footer) - Conditionally show based on organization settings */}
      <section className="bg-muted/20 mt-auto border-t px-4 py-4">
        <div className="container mx-auto max-w-3xl">
          {/* Show custom partners if organization has them, otherwise show default */}
          {organization?.custom_settings?.partners &&
          organization.custom_settings.partners.length > 0 ? (
            <>
              <div className="mb-4 text-center">
                <h2 className="text-foreground text-lg font-semibold tracking-tight">
                  Partners
                </h2>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
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
                      className="group flex items-center justify-center transition-all hover:scale-105"
                    >
                      <div className="relative h-10 w-28 md:h-12 md:w-32">
                        <Image
                          src={partner.logo_url}
                          alt={partner.name}
                          fill
                          className="object-contain opacity-70 transition-opacity group-hover:opacity-100"
                          sizes="(max-width: 768px) 112px, 128px"
                        />
                      </div>
                    </Link>
                  ))}
              </div>
            </>
          ) : (
            (!organization ||
              organization?.custom_settings?.show_partner_section !==
                false) && (
              <>
                <div className="mb-4 text-center">
                  <h2 className="text-foreground text-lg font-semibold tracking-tight">
                    Partners
                  </h2>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                  {PARTNERS.filter(
                    (partner) => partner.name === "Millennium Running",
                  ).map((partner) => (
                    <Link
                      key={partner.name}
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center transition-all hover:scale-105"
                    >
                      <div className="relative h-10 w-28 md:h-12 md:w-32">
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          fill
                          className="object-contain opacity-70 transition-opacity group-hover:opacity-100"
                          sizes="(max-width: 768px) 112px, 128px"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )
          )}

          {/* Footer with organization info */}
          <div className="text-muted-foreground mt-6 space-y-4 text-center text-xs">
            {organization && (
              <div className="flex flex-col items-center justify-center gap-2">
                {/* Social Links with Icons */}
                {organization.social_links && (
                  <div className="flex items-center justify-center gap-3">
                    {organization.social_links.facebook && (
                      <SocialIcon
                        url={organization.social_links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ height: 32, width: 32 }}
                        className="transition-transform hover:scale-110"
                      />
                    )}
                    {organization.social_links.instagram && (
                      <SocialIcon
                        url={organization.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ height: 32, width: 32 }}
                        className="transition-transform hover:scale-110"
                      />
                    )}
                    {organization.social_links.twitter && (
                      <SocialIcon
                        url={organization.social_links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ height: 32, width: 32 }}
                        className="transition-transform hover:scale-110"
                      />
                    )}
                    {organization.social_links.linkedin && (
                      <SocialIcon
                        url={organization.social_links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ height: 32, width: 32 }}
                        className="transition-transform hover:scale-110"
                      />
                    )}
                    {organization.social_links.youtube && (
                      <SocialIcon
                        url={organization.social_links.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ height: 32, width: 32 }}
                        className="transition-transform hover:scale-110"
                      />
                    )}
                  </div>
                )}
                {organization.website_url && (
                  <Link
                    href={organization.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground ml-2 text-sm underline underline-offset-2 transition-colors"
                  >
                    Visit {organization.name}
                  </Link>
                )}
              </div>
            )}
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/privacy-policy"
                className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} {organization?.name || "SnapRace"}.
              All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
