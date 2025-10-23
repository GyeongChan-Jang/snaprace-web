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
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {/* 검색 */}
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search by name or bib number..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-secondary border bg-white pl-10"
        />
      </div>

      {/* 필터들 */}
      <div className="flex gap-2">
        {/* Division 필터 */}
        <Select
          value={filters.division}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, division: value })
          }
        >
          <SelectTrigger className="border-secondary w-[140px] border bg-white">
            <SelectValue placeholder="All Divisions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {divisions.map((div) => (
              <SelectItem key={div} value={div}>
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
          <SelectTrigger className="border-secondary w-[120px] border bg-white">
            <SelectValue placeholder="All Genders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="M">Male</SelectItem>
            <SelectItem value="F">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
