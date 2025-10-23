"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { FilterState } from "./types";

interface LeaderboardFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  divisions: string[];
}

export function LeaderboardFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  divisions,
}: LeaderboardFiltersProps) {
  return (
    <div className="flex flex-col gap-2 md:gap-3 md:flex-row md:items-center">
      {/* 검색 */}
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 md:left-3 md:h-4 md:w-4" />
        <Input
          type="text"
          placeholder="Search by name or bib..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-secondary h-9 border bg-white pl-8 text-xs md:h-10 md:pl-10 md:text-sm"
        />
      </div>

      {/* 필터들 */}
      <div className="flex gap-1.5 md:gap-2">
        {/* Division 필터 */}
        <Select
          value={filters.division}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, division: value })
          }
        >
          <SelectTrigger className="border-secondary h-9 w-[110px] border bg-white text-xs md:h-10 md:w-[140px] md:text-sm">
            <SelectValue placeholder="All Divisions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs md:text-sm">All Divisions</SelectItem>
            {divisions.map((div) => (
              <SelectItem key={div} value={div} className="text-xs md:text-sm">
                {div}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Gender 필터 */}
        <Select
          value={filters.gender}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              gender: value as "all" | "M" | "F",
            })
          }
        >
          <SelectTrigger className="border-secondary h-9 w-[90px] border bg-white text-xs md:h-10 md:w-[120px] md:text-sm">
            <SelectValue placeholder="All Genders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs md:text-sm">All Genders</SelectItem>
            <SelectItem value="M" className="text-xs md:text-sm">Male</SelectItem>
            <SelectItem value="F" className="text-xs md:text-sm">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
