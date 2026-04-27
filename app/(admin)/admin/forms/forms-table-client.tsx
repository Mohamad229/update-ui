"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Loader2,
  Search,
} from "lucide-react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  getFormSubmissions,
  markFormSubmissionReviewed,
  type FormSubmissionFilterOptions,
  type FormSubmissionListItem,
  type PaginatedFormSubmissions,
} from "@/lib/actions/forms";
import { formatDateTime } from "@/lib/utils";

interface FormsTableClientProps {
  initialData: PaginatedFormSubmissions;
  initialNewCount: number;
}

type FormTypeFilter = FormSubmissionFilterOptions["type"] | "ALL";
type StatusFilter = FormSubmissionFilterOptions["status"] | "ALL";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function getStatusBadgeVariant(status: FormSubmissionListItem["status"]) {
  if (status === "NEW") {
    return "warning" as const;
  }
  if (status === "REVIEWED") {
    return "info" as const;
  }
  return "outline" as const;
}

function formatFormType(type: FormSubmissionListItem["type"]) {
  if (type === "PRODUCT_INQUIRY") {
    return "Product Inquiry";
  }
  return `${type.charAt(0)}${type.slice(1).toLowerCase()}`;
}

function formatStatus(status: FormSubmissionListItem["status"]) {
  return `${status.charAt(0)}${status.slice(1).toLowerCase()}`;
}

export function FormsTableClient({
  initialData,
  initialNewCount,
}: FormsTableClientProps) {
  const [rows, setRows] = useState<FormSubmissionListItem[]>(initialData.items);
  const [currentPage, setCurrentPage] = useState(initialData.page);
  const [pageSize, setPageSize] = useState(initialData.pageSize);
  const [totalItems, setTotalItems] = useState(initialData.total);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FormTypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [newCount, setNewCount] = useState(initialNewCount);

  const [isPending, startTransition] = useTransition();
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const { toast } = useToast();
  const debouncedSearch = useDebounce(search, 300);

  const loadSubmissions = useCallback(
    (
      page: number,
      pageSizeValue: number,
      nextSorting: SortingState = sorting,
    ) => {
      startTransition(async () => {
        const sortField = (nextSorting[0]?.id ??
          "createdAt") as FormSubmissionFilterOptions["sortBy"];
        const sortOrder = nextSorting[0]?.desc ? "desc" : "asc";

        const result = await getFormSubmissions({
          page,
          pageSize: pageSizeValue,
          sortBy: sortField,
          sortOrder,
          search: debouncedSearch || undefined,
          type: typeFilter === "ALL" ? undefined : typeFilter,
          status: statusFilter === "ALL" ? undefined : statusFilter,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        });

        if (result.error || !result.data) {
          toast({
            title: "Error",
            description: result.error || "Failed to load submissions",
            variant: "error",
          });
          return;
        }

        setRows(result.data.items);
        setTotalItems(result.data.total);
        setTotalPages(result.data.totalPages);
        setCurrentPage(result.data.page);
        setPageSize(result.data.pageSize);
        setNewCount(
          result.data.items.filter((item) => item.status === "NEW").length,
        );
      });
    },
    [
      debouncedSearch,
      fromDate,
      sorting,
      statusFilter,
      toDate,
      toast,
      typeFilter,
    ],
  );

  useEffect(() => {
    loadSubmissions(1, pageSize);
  }, [
    debouncedSearch,
    typeFilter,
    statusFilter,
    fromDate,
    toDate,
    pageSize,
    loadSubmissions,
  ]);

  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(nextSorting);
      loadSubmissions(1, pageSize, nextSorting);
    },
    [loadSubmissions, pageSize, sorting],
  );

  const handleMarkReviewed = useCallback(
    async (submission: FormSubmissionListItem) => {
      if (submission.status !== "NEW") {
        return;
      }

      setMarkingId(submission.id);
      try {
        const result = await markFormSubmissionReviewed(submission.id);

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "error",
          });
          return;
        }

        toast({
          title: "Submission reviewed",
          description: `Marked ${submission.name} as reviewed`,
          variant: "success",
        });

        loadSubmissions(currentPage, pageSize);
      } finally {
        setMarkingId(null);
      }
    },
    [currentPage, loadSubmissions, pageSize, toast],
  );

  const columns = useMemo<ColumnDef<FormSubmissionListItem>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: () => (
          <button
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary"
            onClick={() =>
              handleSortingChange([
                {
                  id: "name",
                  desc: sorting[0]?.id === "name" ? !sorting[0]?.desc : false,
                },
              ])
            }
          >
            Name
            {sorting[0]?.id === "name" ? (
              sorting[0].desc ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.name}
          </span>
        ),
      },
      {
        id: "email",
        accessorKey: "email",
        header: () => (
          <button
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary"
            onClick={() =>
              handleSortingChange([
                {
                  id: "email",
                  desc: sorting[0]?.id === "email" ? !sorting[0]?.desc : false,
                },
              ])
            }
          >
            Email
            {sorting[0]?.id === "email" ? (
              sorting[0].desc ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ),
      },
      {
        id: "type",
        accessorKey: "type",
        header: () => (
          <button
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary"
            onClick={() =>
              handleSortingChange([
                {
                  id: "type",
                  desc: sorting[0]?.id === "type" ? !sorting[0]?.desc : false,
                },
              ])
            }
          >
            Type
            {sorting[0]?.id === "type" ? (
              sorting[0].desc ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <Badge variant="outline">{formatFormType(row.original.type)}</Badge>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: () => (
          <button
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary"
            onClick={() =>
              handleSortingChange([
                {
                  id: "status",
                  desc: sorting[0]?.id === "status" ? !sorting[0]?.desc : false,
                },
              ])
            }
          >
            Status
            {sorting[0]?.id === "status" ? (
              sorting[0].desc ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <Badge variant={getStatusBadgeVariant(row.original.status)}>
            {formatStatus(row.original.status)}
          </Badge>
        ),
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: () => (
          <button
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary"
            onClick={() =>
              handleSortingChange([
                {
                  id: "createdAt",
                  desc:
                    sorting[0]?.id === "createdAt" ? !sorting[0]?.desc : true,
                },
              ])
            }
          >
            Date
            {sorting[0]?.id === "createdAt" ? (
              sorting[0].desc ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href={`/admin/forms/${row.original.id}`} />}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={
                row.original.status !== "NEW" || markingId === row.original.id
              }
              onClick={() => handleMarkReviewed(row.original)}
              title="Mark reviewed"
            >
              {markingId === row.original.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        ),
      },
    ],
    [handleMarkReviewed, handleSortingChange, markingId, sorting],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    manualSorting: true,
  });

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, company, or message"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
            disabled={isPending}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as FormTypeFilter)
            }
            disabled={isPending}
          >
            <option value="ALL">All types</option>
            <option value="CONTACT">Contact</option>
            <option value="PARTNERSHIP">Partnership</option>
            <option value="PRODUCT_INQUIRY">Product Inquiry</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            disabled={isPending}
          >
            <option value="ALL">All statuses</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ARCHIVED">Archived</option>
          </Select>

          <Input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            disabled={isPending}
          />

          <Input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            disabled={isPending}
          />

          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setTypeFilter("ALL");
              setStatusFilter("ALL");
              setFromDate("");
              setToDate("");
            }}
            disabled={isPending}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {(currentPage - 1) * pageSize + (totalItems > 0 ? 1 : 0)}-
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
        </span>
        <Badge variant={newCount > 0 ? "warning" : "outline"}>
          {newCount} new on this page
        </Badge>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-11 px-4 text-left font-semibold text-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 px-4 text-center text-muted-foreground"
                >
                  {isPending
                    ? "Loading submissions..."
                    : "No submissions found"}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-b-0 hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="h-14 px-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page:</span>
          <Select
            value={String(pageSize)}
            onChange={(event) => {
              const nextPageSize = Number(event.target.value);
              setPageSize(nextPageSize);
              loadSubmissions(1, nextPageSize);
            }}
            className="h-9 w-20"
            disabled={isPending}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSubmissions(1, pageSize)}
            disabled={currentPage === 1 || isPending}
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSubmissions(currentPage - 1, pageSize)}
            disabled={currentPage === 1 || isPending}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="px-2 text-sm text-muted-foreground">
            Page {currentPage} of {Math.max(totalPages, 1)}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSubmissions(currentPage + 1, pageSize)}
            disabled={
              currentPage >= totalPages || isPending || totalPages === 0
            }
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSubmissions(totalPages, pageSize)}
            disabled={
              currentPage >= totalPages || isPending || totalPages === 0
            }
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      )}
    </div>
  );
}
