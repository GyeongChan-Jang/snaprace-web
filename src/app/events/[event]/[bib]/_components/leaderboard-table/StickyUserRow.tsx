"use client";

import { flexRender, type Row } from "@tanstack/react-table";
import { User } from "lucide-react";
import type { EnhancedLeaderboardResult } from "./types";

interface StickyUserRowProps {
  row: Row<EnhancedLeaderboardResult> | null;
}

export function StickyUserRow({ row }: StickyUserRowProps) {
  if (!row) return null;

  return (
    <tr className="bg-primary/10 border-primary sticky top-[36px] z-[5] h-12 border-l-4 shadow-sm hover:bg-primary/20 md:top-[52px] md:h-16">
      {row.getVisibleCells().map((cell, index) => (
        <td key={cell.id} className="p-1.5 md:p-3">
          {index === 0 ? (
            // Rank 열에 User 아이콘 추가
            <div className="flex items-center gap-1 px-1 md:gap-2 md:px-2">
              <User className="text-primary h-3.5 w-3.5 md:h-4 md:w-4" />
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </td>
      ))}
    </tr>
  );
}
