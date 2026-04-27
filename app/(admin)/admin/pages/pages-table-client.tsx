"use client";

import {
  useCallback,
  useMemo,
  useState,
  useTransition,
  useEffect,
} from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit3,
  Search,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Loader2,
  Check,
  X as XIcon,
} from "lucide-react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

import { getPages, deletePage } from "@/lib/actions/pages";
import { formatDate } from "@/lib/utils";
import type { PageListItem } from "@/lib/actions/pages";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface PagesTableClientProps {
  initialData?: {
    pages: PageListItem[];
    total: number;
    pageCount: number;
  };
}

// ============================================================================
// Debounce Hook
// ============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Component
// ============================================================================

export function PagesTableClient({ initialData }: PagesTableClientProps) {
  // State management
  const [data, setData] = useState<PageListItem[]>(initialData?.pages || []);
  const [totalItems, setTotalItems] = useState(initialData?.total || 0);
  const [totalPages, setTotalPages] = useState(initialData?.pageCount || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const [isPending, startTransition] = useTransition();
  const [isInitialLoad, setIsInitialLoad] = useState(!initialData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  // Load initial data if not provided
  useEffect(() => {
    if (isInitialLoad) {
      startTransition(async () => {
        const result = await getPages(1, pageSize);

        if (result.data) {
          setData(result.data.pages);
          setTotalItems(result.data.total);
          setTotalPages(result.data.pageCount);
        }
        setIsInitialLoad(false);
      });
    }
  }, [isInitialLoad, pageSize]);

  // Effect to handle debounced search
  useEffect(() => {
    setCurrentPage(1);

    startTransition(async () => {
      const result = await getPages(1, pageSize);

      if (result.data) {
        // Filter by search term
        const filtered = result.data.pages.filter((page) => {
          const searchLower = debouncedGlobalFilter.toLowerCase();
          const title =
            page.translations.find((t) => t.locale === "en")?.title || "";
          return (
            title.toLowerCase().includes(searchLower) ||
            page.slug.toLowerCase().includes(searchLower)
          );
        });

        setData(filtered);
        setTotalItems(filtered.length);
      }
    });
  }, [debouncedGlobalFilter, pageSize]);

  // Handle sorting changes
  const handleSortingChange = useCallback(
    (sortingUpdater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting =
        typeof sortingUpdater === "function"
          ? sortingUpdater(sorting)
          : sortingUpdater;
      setSorting(newSorting);
      setCurrentPage(1);

      startTransition(async () => {
        const result = await getPages(1, pageSize);

        if (result.data) {
          // Sort the data
          const sorted = [...result.data.pages];

          if (newSorting[0]?.id === "title") {
            sorted.sort((a, b) => {
              const aTitle =
                a.translations.find((t) => t.locale === "en")?.title || "";
              const bTitle =
                b.translations.find((t) => t.locale === "en")?.title || "";
              return newSorting[0]?.desc
                ? bTitle.localeCompare(aTitle)
                : aTitle.localeCompare(bTitle);
            });
          } else if (newSorting[0]?.id === "slug") {
            sorted.sort((a, b) =>
              newSorting[0]?.desc
                ? b.slug.localeCompare(a.slug)
                : a.slug.localeCompare(b.slug),
            );
          } else if (newSorting[0]?.id === "createdAt") {
            sorted.sort((a, b) =>
              newSorting[0]?.desc
                ? b.createdAt.getTime() - a.createdAt.getTime()
                : a.createdAt.getTime() - b.createdAt.getTime(),
            );
          }

          setData(sorted);
          setTotalItems(sorted.length);
        }
      });
    },
    [sorting, pageSize],
  );

  // Handle page deletion
  const handleDeletePage = async (pageId: string) => {
    try {
      setIsDeleting(true);
      const result = await deletePage(pageId);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Success",
          description: "Page deleted successfully",
          variant: "success",
        });
        // Refresh data
        setCurrentPage(1);
        startTransition(async () => {
          const refreshResult = await getPages(1, pageSize);
          if (refreshResult.data) {
            setData(refreshResult.data.pages);
            setTotalItems(refreshResult.data.total);
            setTotalPages(refreshResult.data.pageCount);
          }
        });
      }
    } catch (error) {
      console.error("Failed to delete page:", error);
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  // Simple checkbox component
  const SimpleCheckbox = ({
    checked,
    onChange,
    disabled,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="inline-flex items-center justify-center w-4 h-4 rounded border border-input bg-background disabled:opacity-50"
      aria-label="Checkbox"
    >
      {checked && <Check className="h-3 w-3" />}
    </button>
  );

  // Table columns
  const columns: ColumnDef<PageListItem>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <SimpleCheckbox
            checked={table.getIsAllPageRowsSelected()}
            onChange={(value) => table.toggleAllPageRowsSelected(value)}
          />
        ),
        cell: ({ row }) => (
          <SimpleCheckbox
            checked={row.getIsSelected()}
            onChange={(value) => row.toggleSelected(value)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "title",
        header: ({ column }) => {
          const isActive = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting()}
              className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded"
            >
              Title
              {!isActive && (
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              )}
              {isActive === "asc" && <ArrowUp className="h-4 w-4" />}
              {isActive === "desc" && <ArrowDown className="h-4 w-4" />}
            </button>
          );
        },
        cell: ({ row }) => {
          const page = row.original;
          const title =
            page.translations.find((t) => t.locale === "en")?.title ||
            "Untitled";
          return <div className="font-medium">{title}</div>;
        },
      },
      {
        accessorKey: "slug",
        header: ({ column }) => {
          const isActive = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting()}
              className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded"
            >
              Slug
              {!isActive && (
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              )}
              {isActive === "asc" && <ArrowUp className="h-4 w-4" />}
              {isActive === "desc" && <ArrowDown className="h-4 w-4" />}
            </button>
          );
        },
        cell: ({ row }) => (
          <code className="text-sm bg-muted px-2 py-1 rounded text-muted-foreground">
            {row.original.slug}
          </code>
        ),
      },
      {
        accessorKey: "translations",
        header: "Translations",
        cell: ({ row }) => {
          const locales = row.original.translations
            .map((t) => t.locale.toUpperCase())
            .join(", ");
          return <Badge variant="outline">{locales || "None"}</Badge>;
        },
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const isPublished = row.original.isPublished;
          return (
            <Badge variant={isPublished ? "success" : "outline"}>
              {isPublished ? "Published" : "Draft"}
            </Badge>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          const isActive = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting()}
              className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded"
            >
              Created
              {!isActive && (
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              )}
              {isActive === "asc" && <ArrowUp className="h-4 w-4" />}
              {isActive === "desc" && <ArrowDown className="h-4 w-4" />}
            </button>
          );
        },
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const page = row.original;
          return (
            <div className="flex items-center gap-2">
              <Link href={`/admin/pages/${page.id}/edit`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Link href={`/admin/pages/new?legacy=1&duplicate=${page.id}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-error hover:text-error hover:bg-error/10"
                onClick={() => setDeleteConfirmId(page.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  // Table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualSorting: true,
    manualFiltering: true,
  });

  // Pagination helpers
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);
  const paginatedData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex],
  );

  if (isInitialLoad && isPending) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="page-search"
            name="page-search"
            placeholder="Search by title or slug..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-sm text-muted-foreground"
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
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
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No pages found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
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

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {totalItems > 0 ? startIndex + 1 : 0} to {endIndex} of{" "}
          {totalItems}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1 || isPending}
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={
              currentPage === totalPages || totalPages === 0 || isPending
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={
              currentPage === totalPages || totalPages === 0 || isPending
            }
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this page? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button
              variant="default"
              onClick={() =>
                deleteConfirmId && handleDeletePage(deleteConfirmId)
              }
              disabled={isDeleting}
              className="bg-error text-error-foreground hover:bg-error/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
