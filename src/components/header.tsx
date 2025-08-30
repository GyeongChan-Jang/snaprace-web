"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";

export function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();

  // Disable sticky on photo detail pages: /events/[event]/[bib]
  const isPhotoPage = /^\/events\/[^/]+\/[^/]+$/.test(pathname);

  const navigation = [
    { name: "Search", href: "/" },
    { name: "Events", href: "/events" },
  ];

  return (
    <header
      className={`bg-background/80 ${isPhotoPage ? "" : "sticky top-0 z-50"} w-full border-b backdrop-blur-sm`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-foreground font-montserrat text-xl font-bold">
              SnapRace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-8 md:flex">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm transition-colors ${
                    isActive
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground font-medium"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Search - Disabled */}
          {/* <div className="hidden items-center space-x-2 md:flex">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Enter bib number..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-48 pr-10"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 transform p-0"
              >
                <Search className="h-3 w-3" />
              </Button>
            </form>
          </div> */}

          {/* Mobile Controls */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Mobile Search Toggle - Disabled */}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle search"
            >
              <Search className="h-4 w-4" />
            </Button> */}

            {/* Mobile Menu */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Open menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] px-2 sm:w-[400px]"
              >
                <div className="flex flex-col space-y-4 pt-6">
                  <Link
                    href="/"
                    className="flex items-center space-x-2"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <span className="font-montserrat text-xl font-bold">
                      SnapRace
                    </span>
                  </Link>

                  <nav className="flex flex-col space-y-3">
                    {navigation.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`text-lg transition-colors ${
                            isActive
                              ? "text-foreground font-bold"
                              : "text-muted-foreground hover:text-foreground font-medium"
                          }`}
                          onClick={() => setIsSheetOpen(false)}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Mobile Search in Menu - Disabled */}
                  {/* <div className="border-t pt-4">
                    <form onSubmit={handleSearch} className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Enter bib number..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full"
                      />
                      <Button type="submit" className="w-full">
                        <Search className="mr-2 h-4 w-4" />
                        Find My Photos
                      </Button>
                    </form>
                  </div> */}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
