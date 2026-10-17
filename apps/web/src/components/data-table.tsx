"use client";

import { useEffect, useState, type Key, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DataTableQuery {
  search: string;
  filters: Record<string, string>;
  page: number;
  pageSize: number;
}

export interface DataTableFilterOption {
  value: string;
  label: string;
}

export interface DataTableFilter {
  id: string;
  label: string;
  options: readonly DataTableFilterOption[];
}

export interface DataTableColumn<TData> {
  id: string;
  header: ReactNode;
  cell: (row: TData) => ReactNode;
  headerClassName?: string;
  className?: string;
}

interface DataTableProps<TData> {
  columns: readonly DataTableColumn<TData>[];
  data: readonly TData[];
  getRowId: (row: TData, index: number) => Key;
  query: DataTableQuery;
  onQueryChange: (query: DataTableQuery) => void;
  totalItems: number;
  filters?: readonly DataTableFilter[];
  searchPlaceholder?: string;
  searchLabel?: string;
  debounceMs?: number;
  itemLabel?: { singular: string; plural: string };
  isLoading?: boolean;
  isFetching?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  className?: string;
}

function getPageNumbers(page: number, totalPages: number) {
  const visibleCount = Math.min(totalPages, 5);
  const first = Math.max(1, Math.min(page - 2, totalPages - visibleCount + 1));
  return Array.from({ length: visibleCount }, (_, index) => first + index);
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  query,
  onQueryChange,
  totalItems,
  filters = [],
  searchPlaceholder = "Search entries",
  searchLabel = "Search entries",
  debounceMs = 300,
  itemLabel = { singular: "entry", plural: "entries" },
  isLoading = false,
  isFetching = false,
  errorMessage,
  onRetry,
  emptyMessage = "No entries found.",
  className,
}: DataTableProps<TData>) {
  const [searchInput, setSearchInput] = useState(query.search);
  const pageSize = Math.max(1, query.pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(query.page, totalPages);
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pageNumbers = getPageNumbers(page, totalPages);
  const colSpan = Math.max(columns.length, 1);

  useEffect(() => {
    const search = searchInput.trim();
    if (search === query.search) return;

    const timeout = window.setTimeout(() => {
      onQueryChange({ ...query, search, page: 1 });
    }, debounceMs);

    return () => window.clearTimeout(timeout);
  }, [debounceMs, onQueryChange, query, searchInput]);

  useEffect(() => {
    if (query.page > totalPages) onQueryChange({ ...query, page: totalPages });
  }, [onQueryChange, query, totalPages]);

  const handleFilterChange = (id: string, value: string | null) => {
    if (value === null) return;
    onQueryChange({
      ...query,
      filters: { ...query.filters, [id]: value },
      page: 1,
    });
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 sm:flex-[2]">
          <Search
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label={searchLabel}
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="h-11 w-full bg-background pl-11 text-sm"
          />
        </div>

        {filters.map((filter) => {
          const selectedValue = query.filters[filter.id] ?? filter.options[0]?.value ?? "";
          const selectedLabel =
            filter.options.find((option) => option.value === selectedValue)?.label ?? filter.label;

          return (
            <Select
              key={filter.id}
              value={selectedValue}
              onValueChange={(value) => handleFilterChange(filter.id, value)}
            >
              <SelectTrigger
                aria-label={`Filter by ${filter.label.toLowerCase()}`}
                className="h-11 w-full bg-background px-4 sm:min-w-[180px] sm:flex-[1.1]"
              >
                <SelectValue>{selectedLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "h-12 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-28 text-center text-muted-foreground">
                  <Spinner label="Loading table entries…" showLabel className="size-4" />
                </TableCell>
              </TableRow>
            ) : errorMessage ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-32 text-center">
                  <div className="grid justify-items-center gap-2">
                    <p className="text-sm text-destructive">{errorMessage}</p>
                    {onRetry && (
                      <Button variant="outline" size="sm" onClick={onRetry}>
                        Try again
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-32 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={getRowId(row, index)} className="h-[68px]">
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t px-5 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite">
            Showing {totalItems === 0 ? "0" : `${start}–${end}`} of {totalItems}{" "}
            {totalItems === 1 ? itemLabel.singular : itemLabel.plural}
          </p>
          <nav aria-label="Table pages" className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-10"
              aria-label="Previous page"
              disabled={page <= 1 || isFetching}
              onClick={() => onQueryChange({ ...query, page: Math.max(1, page - 1) })}
            >
              <ChevronLeft />
            </Button>
            {pageNumbers.map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={pageNumber === page ? "default" : "outline"}
                className="size-10 px-0"
                aria-current={pageNumber === page ? "page" : undefined}
                aria-label={`Page ${pageNumber}`}
                disabled={isFetching}
                onClick={() => onQueryChange({ ...query, page: pageNumber })}
              >
                {pageNumber}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="size-10"
              aria-label="Next page"
              disabled={page >= totalPages || isFetching}
              onClick={() => onQueryChange({ ...query, page: Math.min(totalPages, page + 1) })}
            >
              <ChevronRight />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
