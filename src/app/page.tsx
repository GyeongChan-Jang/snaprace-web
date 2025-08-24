"use client";

import { useState } from "react";
import { Search, Camera, Trophy } from "lucide-react";
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

// Mock race data
const MOCK_RACES = [
  { id: "all", name: "All Races", year: "" },
  {
    id: "white-mountain-triathlon",
    name: "White Mountain Triathlon",
    year: "2025",
  },
  { id: "busan-half-2024", name: "Busan Half Marathon", year: "2024" },
  { id: "jeju-ultra-2024", name: "Jeju Ultra Trail", year: "2024" },
  { id: "incheon-10k-2024", name: "Incheon 10K", year: "2024" },
  { id: "daegu-marathon-2023", name: "Daegu Marathon", year: "2023" },
  { id: "gwangju-trail-2023", name: "Gwangju Trail Run", year: "2023" },
];

export default function HomePage() {
  const [bibNumber, setBibNumber] = useState("");
  const [selectedRace, setSelectedRace] = useState("all");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (bibNumber.trim()) {
      if (selectedRace === "all") {
        router.push(`/bib/${bibNumber.trim()}`);
      } else {
        router.push(`/races/${selectedRace}/${bibNumber.trim()}`);
      }
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="from-background via-background to-muted/20 relative bg-gradient-to-br px-4 py-16 sm:py-24">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="bg-primary/10 ring-primary/5 flex h-16 w-16 items-center justify-center rounded-full ring-8">
              <Camera className="text-primary h-8 w-8" />
            </div>
          </div>

          <h1 className="text-foreground font-montserrat mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Find Your Race Photos
            <span className="text-primary"> Instantly</span>
          </h1>

          <p className="text-muted-foreground text-md mx-auto mb-12 max-w-2xl sm:text-xl">
            Select race and enter bib number to discover all your photos.
          </p>

          {/* Main Search */}
          <div className="mx-auto max-w-xl">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Race Selection */}
              <div className="space-y-2">
                <label className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                  <Trophy className="h-4 w-4" />
                  Select Race Event
                </label>
                <Select value={selectedRace} onValueChange={setSelectedRace}>
                  <SelectTrigger className="text-muted-foreground h-14 w-full text-sm font-medium">
                    <SelectValue placeholder="Choose a race" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_RACES.map((race) => (
                      <SelectItem
                        key={race.id}
                        value={race.id}
                        className="py-3"
                      >
                        <div className="flex w-full items-center justify-between">
                          <span
                            className={race.id === "all" ? "font-semibold" : ""}
                          >
                            {race.name}
                          </span>
                          {race.year && (
                            <span className="text-muted-foreground ml-2 text-sm">
                              {race.year}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                  className="h-14 text-lg font-medium"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-14 w-full text-lg font-semibold"
                disabled={!bibNumber.trim()}
              >
                <Search className="mr-2 h-5 w-5" />
                Find My Photos
              </Button>
            </form>

            {/* Quick Stats */}
            {/* <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-primary">50K+</p>
                <p className="text-xs text-muted-foreground">Photos</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-primary">20+</p>
                <p className="text-xs text-muted-foreground">Races</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-primary">10K+</p>
                <p className="text-xs text-muted-foreground">Runners</p>
              </div>
            </div> */}
          </div>

          <p className="text-muted-foreground mt-4 text-sm">
            Don&apos;t know your bib number?{" "}
            <Link href="/races" className="text-primary hover:underline">
              Browse all races
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
    </div>
  );
}
