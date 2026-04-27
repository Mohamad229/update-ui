"use client";

import {
  useCallback,
  useMemo,
  useState,
  useTransition,
  useEffect,
} from "react";
import Link from "next/link";
import Image from "next/image";
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
  Plus,
  Loader2,
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
import { getProducts, deleteProduct } from "@/lib/actions/products";
import type {
  ProductListItem,
  PaginatedProducts,
} from "@/lib/actions/products";
import { formatDate } from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ProductsTableClientProps {
  initialData?: PaginatedProducts;
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
// Components
// ============================================================================

export function ProductsTableClient({ initialData }: ProductsTableClientProps) {
  // State management
  const [data, setData] = useState<ProductListItem[]>(initialData?.items || []);
  const [totalItems, setTotalItems] = useState(initialData?.total || 0);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 0);
  const [currentPage, setCurrentPage] = useState(initialData?.page || 1);
  const [pageSize, setPageSize] = useState(initialData?.pageSize || 20);

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
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  // Load initial data if not provided
  useEffect(() => {
    if (isInitialLoad) {
      startTransition(async () => {
        const result = await getProducts({
          page: 1,
          pageSize: 20,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        if (result.data) {
          setData(result.data.items);
          setTotalItems(result.data.total);
          setTotalPages(result.data.totalPages);
          setCurrentPage(result.data.page);
          setPageSize(result.data.pageSize);
        }
        setIsInitialLoad(false);
      });
    }
  }, [isInitialLoad]);

  // Effect to handle debounced search
  useEffect(() => {
    setCurrentPage(1);

    startTransition(async () => {
      const result = await getProducts({
        page: 1,
        pageSize,
        search: debouncedGlobalFilter || undefined,
        sortBy:
          (sorting[0]?.id as "name" | "createdAt" | "status") || "createdAt",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      });

      if (result.data) {
        setData(result.data.items);
        setTotalItems(result.data.total);
        setTotalPages(result.data.totalPages);
        setCurrentPage(result.data.page);
      }
    });
  }, [debouncedGlobalFilter, pageSize, sorting]);

  // Handle sorting changes - wrapped to work with useReactTable
  const handleSortingChange = useCallback(
    (sortingUpdater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting =
        typeof sortingUpdater === "function"
          ? sortingUpdater(sorting)
          : sortingUpdater;
      setSorting(newSorting);
      setCurrentPage(1);

      startTransition(async () => {
        const result = await getProducts({
          page: 1,
          pageSize,
          search: globalFilter || undefined,
          sortBy:
            (newSorting[0]?.id as "name" | "createdAt" | "status") ||
            "createdAt",
          sortOrder: newSorting[0]?.desc ? "desc" : "asc",
        });

        if (result.data) {
          setData(result.data.items);
          setTotalItems(result.data.total);
          setTotalPages(result.data.totalPages);
          setCurrentPage(result.data.page);
        }
      });
    },
    [sorting, pageSize, globalFilter],
  );

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);

    startTransition(async () => {
      const result = await getProducts({
        page: newPage,
        pageSize,
        search: globalFilter || undefined,
        sortBy:
          (sorting[0]?.id as "name" | "createdAt" | "status") || "createdAt",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      });

      if (result.data) {
        setData(result.data.items);
        setTotalItems(result.data.total);
        setTotalPages(result.data.totalPages);
        setCurrentPage(result.data.page);
      }
    });
  };

  // Handle page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);

    startTransition(async () => {
      const result = await getProducts({
        page: 1,
        pageSize: newPageSize,
        search: globalFilter || undefined,
        sortBy:
          (sorting[0]?.id as "name" | "createdAt" | "status") || "createdAt",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      });

      if (result.data) {
        setData(result.data.items);
        setTotalItems(result.data.total);
        setTotalPages(result.data.totalPages);
        setCurrentPage(result.data.page);
        setPageSize(result.data.pageSize);
      }
    });
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).filter(
      (key) => rowSelection[key],
    );

    if (selectedIds.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} product(s)?`,
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      await Promise.all(selectedIds.map((id) => deleteProduct(id)));

      setRowSelection({});

      // Refetch data
      startTransition(async () => {
        const result = await getProducts({
          page: 1,
          pageSize,
          search: globalFilter || undefined,
          sortBy:
            (sorting[0]?.id as "name" | "createdAt" | "status") || "createdAt",
          sortOrder: sorting[0]?.desc ? "desc" : "asc",
        });

        if (result.data) {
          setData(result.data.items);
          setTotalItems(result.data.total);
          setTotalPages(result.data.totalPages);
          setCurrentPage(result.data.page);
        }
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Define columns
  const columns = useMemo<ColumnDef<ProductListItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) =>
              table.toggleAllPageRowsSelected(!!e.target.checked)
            }
            className="h-4 w-4 rounded border-gray-300 cursor-pointer"
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 cursor-pointer"
            aria-label={`Select row ${row.original.name}`}
          />
        ),
        size: 50,
      },
      {
        id: "image",
        header: "Image",
        cell: ({ row }) => {
          const coverImage = row.original.coverImage;
          return coverImage ? (
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
              <Image
                src={coverImage}
                alt={row.original.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
              N/A
            </div>
          );
        },
        size: 50,
      },
      {
        id: "name",
        header: () => (
          <button
            onClick={() =>
              handleSortingChange([{ id: "name", desc: !sorting[0]?.desc }])
            }
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary cursor-pointer"
          >
            Name
            {sorting[0]?.id === "name" ? (
              sorting[0]?.desc ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ),
        accessorKey: "name",
        cell: ({ row }) => (
          <span className="font-medium text-foreground max-w-xs truncate block">
            {row.original.name}
          </span>
        ),
      },
      {
        id: "type",
        header: "Type",
        accessorKey: "type",
        cell: ({ row }) => {
          const type = row.original.type;
          return (
            <Badge variant={type === "SIMPLE" ? "info" : "warning"}>
              {type === "SIMPLE" ? "Simple" : "Advanced"}
            </Badge>
          );
        },
        size: 100,
      },
      {
        id: "status",
        header: () => (
          <button
            onClick={() =>
              handleSortingChange([{ id: "status", desc: !sorting[0]?.desc }])
            }
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary cursor-pointer"
          >
            Status
            {sorting[0]?.id === "status" ? (
              sorting[0]?.desc ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ),
        accessorKey: "status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={status === "AVAILABLE" ? "success" : "warning"}>
              {status === "AVAILABLE" ? "Available" : "Pipeline"}
            </Badge>
          );
        },
        size: 100,
      },
      {
        id: "visibility",
        header: "Visibility",
        cell: ({ row }) => (
          <Badge variant={row.original.isPublished ? "success" : "outline"}>
            {row.original.isPublished ? "Published" : "Draft"}
          </Badge>
        ),
        size: 110,
      },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) => {
          const category = row.original.category;
          return category ? (
            <span className="text-sm text-foreground">{category.name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          );
        },
      },
      {
        id: "manufacturer",
        header: "Manufacturer",
        cell: ({ row }) => {
          const manufacturer = row.original.manufacturer;
          return manufacturer ? (
            <span className="text-sm text-foreground">{manufacturer.name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          );
        },
      },
      {
        id: "createdAt",
        header: () => (
          <button
            onClick={() =>
              handleSortingChange([
                { id: "createdAt", desc: !sorting[0]?.desc },
              ])
            }
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary cursor-pointer"
          >
            Created
            {sorting[0]?.id === "createdAt" ? (
              sorting[0]?.desc ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ),
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link href={`/admin/products/${row.original.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Edit product"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Delete product"
              onClick={async () => {
                if (confirm(`Delete "${row.original.name}"?`)) {
                  setIsDeleting(true);
                  try {
                    await deleteProduct(row.original.id);
                    // Refetch data
                    startTransition(async () => {
                      const result = await getProducts({
                        page: currentPage,
                        pageSize,
                        search: globalFilter || undefined,
                        sortBy:
                          (sorting[0]?.id as "name" | "createdAt" | "status") ||
                          "createdAt",
                        sortOrder: sorting[0]?.desc ? "desc" : "asc",
                      });

                      if (result.data) {
                        setData(result.data.items);
                        setTotalItems(result.data.total);
                        setTotalPages(result.data.totalPages);
                        setCurrentPage(result.data.page);
                      }
                    });
                  } finally {
                    setIsDeleting(false);
                  }
                }
              }}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
        size: 100,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
  });

  // Count selected rows
  const selectedRowCount = Object.keys(rowSelection).filter(
    (k) => rowSelection[k],
  ).length;

  // Show loading skeleton
  if (isInitialLoad && isPending) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="border rounded-lg bg-card">
          <div className="h-[400px] bg-muted/50 animate-pulse" />
        </div>
      </div>
    );
  }

  // Show empty state
  if (data.length === 0 && !globalFilter) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/25 bg-card/50 p-12">
        <Plus className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          No products yet
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Create your first product to get started managing your product
          catalog.
        </p>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create First Product
          </Button>
        </Link>
      </div>
    );
  }

  // Show no search results
  if (data.length === 0 && globalFilter) {
    return (
      <div className="w-full space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/25 bg-card/50 p-12">
          <Search className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">
            No results found
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            No products match your search &quot;{globalFilter}&quot;. Try
            adjusting your search terms.
          </p>
          <Button variant="outline" onClick={() => setGlobalFilter("")}>
            Clear search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
            disabled={isPending}
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedRowCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedRowCount} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting || isPending}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </>
                )}
              </Button>
            </div>
          )}

          <Link href="/admin/products/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Product</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b bg-muted/50 hover:bg-muted/75 transition-colors"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-semibold text-foreground [&:has([role=checkbox])]:pr-0"
                      style={{
                        width: header.getSize(),
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
            <tbody className="divide-y">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/50 transition-colors data-[state=selected]:bg-muted"
                    data-state={row.getIsSelected() ? "selected" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="h-14 px-4 align-middle text-sm [&:has([role=checkbox])]:pr-0"
                        style={{
                          width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {isPending ? "Loading products..." : "No products found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-muted-foreground ml-2">
            {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || isPending}
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return pageNum;
            }).map((pageNum) => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                disabled={isPending}
                className="h-9 w-9 p-0"
              >
                {pageNum}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || isPending}
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      )}
    </div>
  );
}
