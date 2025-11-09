import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ArrowUpDown, Phone, Scale, CheckCircle2, AlertCircle, Clock, Loader2, PhoneCall, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatCurrency, calculateSavings } from "../../lib/utils";
import { toast } from "sonner";
import { CompareDrawer } from "./CompareDrawer";
import { QuoteRecordForm } from "../quotes/QuoteRecordForm";

export interface Listing {
  _id: Id<"listings">;
  dealerName: string;
  phone: string;
  address?: string;
  msrp: number;
  discountedPrice: number;
  mpg: number;
  distance?: number;
  selected: boolean;
  callStatus?: "queued" | "dialing" | "connected" | "completed" | "failed";
  callId?: Id<"calls">;
  hasQuote?: boolean;
}

interface ListingsTableProps {
  listings: Listing[];
  sessionId: Id<"sessions">;
}

export function ListingsTable({ listings, sessionId }: ListingsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [compareDrawerOpen, setCompareDrawerOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [quoteFormOpen, setQuoteFormOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const toggleSelect = useMutation(api.listings.toggleSelect);
  const initiateBatchCalls = useAction(api.actions.initiateBatchCalls);

  // Handle selection toggle
  const handleToggleSelection = async (listingId: Id<"listings">, currentSelected: boolean) => {
    try {
      await toggleSelect({
        id: listingId,
        selected: !currentSelected,
      });
    } catch (error) {
      console.error("Failed to toggle selection:", error);
      toast.error("Failed to update selection");
    }
  };

  const columns: ColumnDef<Listing>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value: boolean) => {
              table.toggleAllPageRowsSelected(!!value);
              // Also update server-side selection
              const allListings = table.getRowModel().rows.map(row => row.original);
              allListings.forEach(listing => {
                handleToggleSelection(listing._id, !value);
              });
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.original.selected}
            onCheckedChange={() => {
              handleToggleSelection(row.original._id, row.original.selected);
            }}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "dealerName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Dealer
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.dealerName}</div>
            <div className="text-sm text-muted-foreground">{row.original.phone}</div>
            {row.original.address && (
              <div className="text-xs text-muted-foreground">{row.original.address}</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "msrp",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              MSRP
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground line-through">
            {formatCurrency(row.original.msrp)}
          </div>
        ),
      },
      {
        accessorKey: "discountedPrice",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Price
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const savings = calculateSavings(row.original.msrp, row.original.discountedPrice);
          return (
            <div>
              <div className="font-bold text-primary">
                {formatCurrency(row.original.discountedPrice)}
              </div>
              {savings > 0 && (
                <div className="text-xs text-green-600">
                  Save {savings}%
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "mpg",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              MPG
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.original.mpg}</div>,
      },
      {
        accessorKey: "distance",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Distance
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.distance ? `${row.original.distance.toFixed(1)} mi` : "—"}
          </div>
        ),
      },
      {
        accessorKey: "callStatus",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.callStatus;
          if (!status) return <div className="text-xs text-muted-foreground">—</div>;

          const statusConfig = {
            queued: { icon: Clock, color: "text-gray-500", label: "Queued" },
            dialing: { icon: PhoneCall, color: "text-blue-500", label: "Calling" },
            connected: { icon: Loader2, color: "text-blue-600 animate-spin", label: "Connected" },
            completed: { icon: CheckCircle2, color: "text-green-600", label: "Completed" },
            failed: { icon: AlertCircle, color: "text-red-600", label: "Failed" },
          };

          const config = statusConfig[status];
          const Icon = config.icon;

          return (
            <div className="flex items-center gap-1.5">
              <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              <span className={`text-xs font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const listing = row.original;

          // Only show "Record Quote" button if call is completed and no quote exists
          if (listing.callStatus === "completed" && !listing.hasQuote && listing.callId) {
            return (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedListing(listing);
                  setQuoteFormOpen(true);
                }}
              >
                <FileText className="h-3 w-3 mr-1.5" />
                Record Quote
              </Button>
            );
          }

          if (listing.hasQuote) {
            return (
              <span className="text-xs text-green-600 font-medium">
                Quote Received
              </span>
            );
          }

          return <div className="text-xs text-muted-foreground">—</div>;
        },
        enableSorting: false,
      },
    ],
    []
  );

  const table = useReactTable({
    data: listings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const selectedCount = listings.filter((l) => l.selected).length;

  const handleInitiateCalls = async () => {
    const selectedListings = listings.filter((l) => l.selected);
    if (selectedListings.length === 0) {
      toast.error("Please select at least one dealer");
      return;
    }

    setIsCalling(true);
    try {
      toast.loading(`Initiating calls to ${selectedListings.length} dealer${selectedListings.length !== 1 ? "s" : ""}...`, {
        id: "batch-calls"
      });

      const result = await initiateBatchCalls({
        sessionId,
        listingIds: selectedListings.map((l) => l._id),
      });

      toast.success(
        `Successfully initiated ${result.callCount} call${result.callCount !== 1 ? "s" : ""}! AI agents are now calling dealers.`,
        { id: "batch-calls" }
      );
    } catch (error) {
      console.error("Failed to initiate batch calls:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to initiate calls. Please try again.",
        { id: "batch-calls" }
      );
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter dealers..."
          value={(table.getColumn("dealerName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("dealerName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-2">
          {selectedCount >= 2 && (
            <Button
              onClick={() => setCompareDrawerOpen(true)}
              variant="outline"
            >
              <Scale className="h-4 w-4 mr-2" />
              Compare ({selectedCount})
            </Button>
          )}
          {selectedCount > 0 && (
            <Button onClick={handleInitiateCalls} disabled={isCalling}>
              <Phone className="h-4 w-4 mr-2" />
              {isCalling ? "Initiating..." : `Call ${selectedCount} Dealer${selectedCount !== 1 ? "s" : ""}`}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No dealers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedCount} of {listings.length} dealer(s) selected
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Compare Drawer */}
      <CompareDrawer
        open={compareDrawerOpen}
        onOpenChange={setCompareDrawerOpen}
        listings={listings}
      />

      {/* Quote Record Form */}
      {selectedListing && selectedListing.callId && (
        <QuoteRecordForm
          open={quoteFormOpen}
          onOpenChange={setQuoteFormOpen}
          callId={selectedListing.callId}
          listingId={selectedListing._id}
          sessionId={sessionId}
          dealerName={selectedListing.dealerName}
        />
      )}
    </div>
  );
}
