"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SourcesPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
}

const pageSizeOptions = [12, 24] as const;

const navButtonClass =
  "disabled:pointer-events-none disabled:border-[#e7e7e9] disabled:bg-[#FAFAFA] disabled:text-[#a3a3a3] disabled:opacity-100";

export function SourcesPagination({
  page,
  totalPages,
  limit,
  onLimitChange,
  onPageChange,
}: SourcesPaginationProps) {
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-3">
      <div className="flex flex-col items-center gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-self-start">
          <span className="text-xs text-muted-foreground">Page size</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger size="sm" className="min-w-20 bg-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-center text-xs font-medium text-muted-foreground">
          Page {page}
        </p>

        <div className="flex items-center gap-2 sm:justify-self-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isFirstPage}
            className={cn(navButtonClass)}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isLastPage}
            className={cn(navButtonClass)}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
