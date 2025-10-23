import type { ColumnDef, Column } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { PerformanceTierBadge } from "@/components/performance/PerformanceTierBadge";
import {
  Medal,
  Award,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EnhancedLeaderboardResult } from "./types";

// 정렬 아이콘 헬퍼 컴포넌트
function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") {
    return <ChevronUp className="ml-2 h-4 w-4" />;
  }
  if (isSorted === "desc") {
    return <ChevronDown className="ml-2 h-4 w-4" />;
  }
  return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
}

// 정렬 클릭 핸들러 (기본 -> 내림차순 -> 오름차순 -> 기본)
function handleSortClick<TData, TValue>(column: Column<TData, TValue>) {
  const current = column.getIsSorted();
  if (current === false) {
    column.toggleSorting(true); // desc
  } else if (current === "desc") {
    column.toggleSorting(false); // asc
  } else {
    column.clearSorting(); // false
  }
}

export const columns: ColumnDef<EnhancedLeaderboardResult>[] = [
  // Rank
  {
    accessorKey: "rank",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => handleSortClick(column)}
          className="h-8 px-2"
        >
          Rank
          <SortIcon isSorted={column.getIsSorted()} />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rank = row.original.rank;
      const result = row.original;

      return (
        <div className="flex items-center gap-2 px-2">
          {rank === 1 && (
            <Medal className="h-5 w-5 text-yellow-500" aria-label="1st place" />
          )}
          {rank === 2 && (
            <Medal className="h-5 w-5 text-gray-400" aria-label="2nd place" />
          )}
          {rank === 3 && (
            <Medal className="h-5 w-5 text-orange-600" aria-label="3rd place" />
          )}
          {result.isDivisionWinner && rank > 3 && (
            <Award
              className="h-4 w-4 text-blue-500"
              aria-label="Division winner"
            />
          )}
          <span className="font-semibold">{rank}</span>
        </div>
      );
    },
    size: 120,
    enableSorting: true,
  },

  // Bib
  {
    accessorKey: "bib",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => handleSortClick(column)}
          className="h-8 px-2"
        >
          Bib
          <SortIcon isSorted={column.getIsSorted()} />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.bib}
      </Badge>
    ),
    size: 100,
    enableSorting: true,
  },

  // Name
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => handleSortClick(column)}
          className="h-8 px-2"
        >
          Name
          <SortIcon isSorted={column.getIsSorted()} />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name || "—"}</span>
    ),
    size: 200,
    enableSorting: true,
  },

  // Chip Time
  {
    accessorKey: "chipTime",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => handleSortClick(column)}
            className="h-8 px-2"
          >
            Chip Time
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">
        <span className="font-mono font-semibold">
          {row.original.chipTime || "—"}
        </span>
      </div>
    ),
    size: 130,
    enableSorting: true,
  },

  // Pace
  {
    accessorKey: "avgPace",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => handleSortClick(column)}
            className="h-8 px-2"
          >
            Pace
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">
        <span className="font-mono text-sm">{row.original.avgPace || "—"}</span>
      </div>
    ),
    size: 110,
    enableSorting: true,
  },

  // Division (Gender + Age)
  {
    accessorKey: "division",
    header: "Division",
    cell: ({ row }) => {
      const result = row.original;
      return (
        <div className="flex items-center gap-2">
          {result.gender && (
            <Badge variant="secondary" className="text-xs">
              {result.gender}
            </Badge>
          )}
          {result.age && (
            <span className="text-muted-foreground text-sm">{result.age}</span>
          )}
        </div>
      );
    },
    size: 130,
    enableSorting: false,
  },

  // Division Place
  {
    accessorKey: "divisionPlace",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => handleSortClick(column)}
            className="h-8 px-2"
          >
            Div. Place
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">{row.original.divisionPlace || "—"}</div>
    ),
    size: 120,
    enableSorting: true,
  },

  // Performance
  {
    accessorKey: "agePerformance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => handleSortClick(column)}
          className="h-8 px-2"
        >
          Performance
          <SortIcon isSorted={column.getIsSorted()} />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.original.agePerformance;
      return value && value > 0 ? (
        <PerformanceTierBadge value={value} className="text-xs" />
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
    size: 160,
    enableSorting: true,
  },
];
