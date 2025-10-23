"use client";

import { useState, useMemo } from "react";
import { Trophy } from "lucide-react";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LeaderboardTableAdvanced } from "./leaderboard-table/LeaderboardTableAdvanced";
import type { EventResultsResponse } from "@/server/services/timing-service";

interface EventLeaderboardProps {
  eventId: string;
  eventName: string; // Reserved for future use (analytics, etc.)
  organizationId: string;
  highlightBib?: string;
}

export function EventLeaderboard({
  eventId,
  eventName,
  organizationId,
  highlightBib,
}: EventLeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch all categories without filtering
  const resultsQuery = api.results.getAllResults.useQuery(
    {
      eventId,
      organizationId,
      // Don't filter by category - load all categories
    },
    {
      enabled: !!eventId && !!organizationId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  // Get available categories
  const categories = useMemo(() => {
    if (!resultsQuery.data?.resultSets) return [];
    return resultsQuery.data.resultSets.map((rs) => ({
      id: rs.id,
      name: rs.category,
      count: rs.totalResults,
    }));
  }, [resultsQuery.data]);

  // Auto-select first category if none selected
  useMemo(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]!.id);
    }
  }, [categories, selectedCategory]);

  // Get current result set
  const currentResults = useMemo(() => {
    if (!resultsQuery.data?.resultSets) return [];
    if (!selectedCategory) return resultsQuery.data.resultSets[0]?.results ?? [];
    const resultSet = resultsQuery.data.resultSets.find(
      (rs) => rs.id === selectedCategory,
    );
    return resultSet?.results ?? [];
  }, [resultsQuery.data, selectedCategory]);

  if (resultsQuery.isLoading) {
    return <EventLeaderboardSkeleton />;
  }

  if (resultsQuery.error || !resultsQuery.data) {
    return null; // Silently fail - leaderboard is optional
  }

  if (currentResults.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto mt-8 px-1 md:px-4">
      <section className="border-border/60 bg-muted/30 rounded-3xl border p-4 shadow-sm md:p-6">
        {/* Leaderboard Table with Accordion */}
        <Accordion type="single" collapsible defaultValue="leaderboard">
          <AccordionItem value="leaderboard" className="border-0">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Trophy className="text-primary h-5 w-5" />
                <h2 className="text-lg font-semibold md:text-xl">Event Leaderboard</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {/* Category Tabs and Results Count */}
              {categories.length > 1 && (
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          selectedCategory === category.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {category.name}
                        <span className="ml-2 text-xs opacity-70">
                          ({category.count})
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="text-muted-foreground shrink-0 text-sm">
                    {currentResults.length} result{currentResults.length !== 1 ? "s" : ""} found
                  </div>
                </div>
              )}

              <LeaderboardTableAdvanced
                results={currentResults}
                highlightBib={highlightBib}
                showResultsCount={categories.length === 1}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}

export function EventLeaderboardSkeleton() {
  return (
    <div className="container mx-auto mt-8 px-1 md:px-4">
      <section className="border-border/60 bg-muted/30 rounded-3xl border p-4 shadow-sm md:p-6">
        {/* Header Skeleton */}
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Table/Cards Skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </section>
    </div>
  );
}
