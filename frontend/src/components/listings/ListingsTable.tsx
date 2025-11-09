import { useState, useMemo, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Phone, Scale, CheckCircle2, AlertCircle, Clock, Loader2, PhoneCall, FileText, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { formatCurrency, calculateSavings } from "../../lib/utils";
import { toast } from "sonner";
import { CompareDrawer } from "./CompareDrawer";
import { QuoteRecordForm } from "../quotes/QuoteRecordForm";

// Backend API call types
interface BackendCall {
  id: number;
  user_id?: string;
  call_id?: string;
  model?: string;
  year?: number;
  zipcode?: string;
  dealer_name?: string;
  phone_number?: string;
  msrp?: number;
  listing_price?: number;
  status?: "pending" | "completed" | "failed";
  is_available?: boolean;
  deal_price?: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

interface BackendCallsResponse {
  success: boolean;
  count: number;
  data: BackendCall[];
}

export interface Listing {
  _id: Id<"listings">;
  dealerName: string;
  phone: string;
  address?: string;
  msrp: number;
  discountedPrice: number;
  dealPrice?: number; // Confirmed price from dealer call
  mpg: number;
  distance?: number;
  selected: boolean;
  callStatus?: "queued" | "dialing" | "connected" | "completed" | "failed";
  callId?: Id<"calls">;
  hasQuote?: boolean;
  imageUrls?: string[];
  link?: string;
}

interface ListingsTableProps {
  listings: Listing[];
  sessionId: Id<"sessions">;
}

export function ListingsTable({ listings, sessionId }: ListingsTableProps) {

  console.log("listings", listings);
  console.log("sessionId", sessionId);
  const [filterValue, setFilterValue] = useState("");
  const [compareDrawerOpen, setCompareDrawerOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [quoteFormOpen, setQuoteFormOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [backendCalls, setBackendCalls] = useState<Map<string, BackendCall>>(new Map());

  const toggleSelect = useMutation(api.listings.toggleSelect);
  const initiateBatchCalls = useAction(api.actions.initiateBatchCalls);

  // Fetch call data from backend API
  const fetchCallData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/calls`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: BackendCallsResponse = await response.json();
      
      if (data.success && data.data) {
        // Map calls by dealer name for quick lookup
        const callsMap = new Map<string, BackendCall>();
        data.data.forEach((call) => {
          if (call.dealer_name) {
            callsMap.set(call.dealer_name, call);
          }
        });
        setBackendCalls(callsMap);
      }
    } catch (error) {
      console.error("Failed to fetch call data:", error);
    }
  };

  // Poll for call updates every 3 seconds
  useEffect(() => {
    fetchCallData(); // Initial fetch
    const interval = setInterval(fetchCallData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Merge backend call data with listings
  const listingsWithCallData = useMemo(() => {
    return listings.map((listing) => {
      const backendCall = backendCalls.get(listing.dealerName);
      if (backendCall && backendCall.status) {
        // Map backend status to our call status
        let callStatus: Listing["callStatus"];
        switch (backendCall.status) {
          case "pending":
            callStatus = "dialing";
            break;
          case "completed":
            callStatus = "completed";
            break;
          case "failed":
            callStatus = "failed";
            break;
          default:
            callStatus = listing.callStatus;
        }
        
        return {
          ...listing,
          callStatus,
          hasQuote: backendCall.is_available ? true : listing.hasQuote,
          dealPrice: backendCall.deal_price,
        };
      }
      return listing;
    });
  }, [listings, backendCalls]);

  // Filter listings based on search
  const filteredListings = useMemo(() => {
    if (!filterValue) return listingsWithCallData;
    return listingsWithCallData.filter((listing) =>
      listing.dealerName.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [listingsWithCallData, filterValue]);

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

  // Render status badge
  const renderStatusBadge = (status?: "queued" | "dialing" | "connected" | "completed" | "failed") => {
    if (!status) return null;

    const statusConfig = {
      queued: { icon: Clock, color: "text-gray-500", label: "Queued", variant: "outline" as const },
      dialing: { icon: PhoneCall, color: "text-blue-500", label: "Calling", variant: "outline" as const },
      connected: { icon: Loader2, color: "text-blue-600 animate-spin", label: "Connected", variant: "outline" as const },
      completed: { icon: CheckCircle2, color: "text-green-600", label: "Completed", variant: "outline" as const },
      failed: { icon: AlertCircle, color: "text-red-600", label: "Failed", variant: "destructive" as const },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span className={config.color}>{config.label}</span>
      </Badge>
    );
  };

  const selectedCount = listingsWithCallData.filter((l) => l.selected).length;

  const handleInitiateCalls = async () => {
    const selectedListings = listingsWithCallData.filter((l) => l.selected);
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
      
      // Immediately fetch updated call data
      fetchCallData();
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
          value={filterValue}
          onChange={(event) => setFilterValue(event.target.value)}
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

      {/* Listings Count */}
      <div className="text-sm text-muted-foreground">
        {selectedCount} of {listingsWithCallData.length} dealer(s) selected
      </div>

      {/* Accordion List */}
      <div className="rounded-md border">
        {filteredListings.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {filteredListings.map((listing) => {
              // Use dealPrice if available, otherwise use discountedPrice
              const displayPrice = listing.dealPrice ?? listing.discountedPrice;
              const savings = calculateSavings(listing.msrp, displayPrice);
              const isConfirmedPrice = listing.dealPrice !== undefined;
              
              return (
                <AccordionItem key={listing._id} value={listing._id}>
                  <AccordionTrigger className="hover:no-underline px-4">
                    <div className="flex items-center gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={listing.selected}
                        onCheckedChange={() => {
                          handleToggleSelection(listing._id, listing.selected);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Select listing"
                      />
                      
                      <div className="flex items-center justify-between flex-1 text-left">
                        <div className="flex flex-col gap-1">
                          <div className="font-semibold text-base">{listing.dealerName}</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl font-bold text-primary">
                              {formatCurrency(displayPrice)}
                            </span>
                            {isConfirmedPrice && (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Confirmed
                              </Badge>
                            )}
                            {savings > 0 && (
                              <Badge variant="outline" className="border-green-600 text-green-600">
                                Save {savings}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(listing.callStatus)}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 pt-2">
                      {/* Image Carousel */}
                      {listing.imageUrls && listing.imageUrls.length > 0 && (
                        <div className="w-full">
                          <Carousel className="w-full max-w-2xl mx-auto">
                            <CarouselContent>
                              {listing.imageUrls.map((imageUrl, index) => (
                                <CarouselItem key={index}>
                                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                    <img
                                      src={imageUrl}
                                      alt={`${listing.dealerName} vehicle ${index + 1}`}
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://via.placeholder.com/640x480?text=Image+Not+Available";
                                      }}
                                    />
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                          </Carousel>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Contact</div>
                            <div className="text-sm mt-1">{listing.phone}</div>
                            {listing.address && (
                              <div className="flex items-start gap-1 text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                                <span>{listing.address}</span>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">MSRP</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm">
                                {formatCurrency(listing.msrp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Column */}
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Fuel Economy</div>
                            <div className="text-sm mt-1">{listing.mpg} MPG</div>
                          </div>
                          
                          {listing.distance !== undefined && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Distance</div>
                              <div className="text-sm mt-1">{listing.distance.toFixed(1)} mi</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {listing.link && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => window.open(listing.link, "_blank")}
                            className="flex-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-2" />
                            Visit Dealer Page
                          </Button>
                        )}
                        
                        {listing.callStatus === "completed" && !listing.hasQuote && listing.callId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedListing(listing);
                              setQuoteFormOpen(true);
                            }}
                            className="flex-1"
                          >
                            <FileText className="h-3.5 w-3.5 mr-2" />
                            Record Quote
                          </Button>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No dealers found.
          </div>
        )}
      </div>

      {/* Compare Drawer */}
      <CompareDrawer
        open={compareDrawerOpen}
        onOpenChange={setCompareDrawerOpen}
        listings={listingsWithCallData}
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
