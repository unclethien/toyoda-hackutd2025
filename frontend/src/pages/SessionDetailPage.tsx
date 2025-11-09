import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { ListingsTable } from "@/components/listings/ListingsTable";
import type { Listing as ListingType } from "@/components/listings/ListingsTable";
import { QuoteDisplay } from "@/components/quotes/QuoteDisplay";

export const SessionDetailPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const session = useQuery(
    api.sessions.get,
    sessionId ? { id: sessionId as Id<"sessions"> } : "skip"
  );

  const listings = useQuery(
    api.listings.listBySession,
    sessionId ? { sessionId: sessionId as Id<"sessions"> } : "skip"
  );

  const calls = useQuery(
    api.calls.listBySession,
    sessionId ? { sessionId: sessionId as Id<"sessions"> } : "skip"
  );

  const quotes = useQuery(
    api.quotes.listBySession,
    sessionId ? { sessionId: sessionId as Id<"sessions"> } : "skip"
  );

  const stats = useQuery(
    api.sessions.getStats,
    sessionId ? { id: sessionId as Id<"sessions"> } : "skip"
  );

  // Combine listings with call status and quote data, filter for unique dealer names
  const listingsWithStatus = listings && calls
    ? (() => {
        const allListingsWithStatus = listings.map((listing) => {
          const call = calls.find((c) => c.listingId === listing._id);
          const hasQuote = quotes?.some((q) => q.listingId === listing._id) || false;
          return {
            ...listing,
            callStatus: call?.status,
            callId: call?._id,
            hasQuote,
          };
        });

        // Filter to keep only unique dealer names (keep first occurrence)
        const seenDealers = new Set<string>();
        return allListingsWithStatus.filter((listing) => {
          if (seenDealers.has(listing.dealerName)) {
            return false;
          }
          seenDealers.add(listing.dealerName);
          return true;
        });
      })()
    : [];

  // Combine quotes with dealer info for display
  const quotesWithDealerInfo = quotes && listings
    ? quotes.map((quote) => {
        const listing = listings.find((l) => l._id === quote.listingId);
        return {
          ...quote,
          dealerName: listing?.dealerName || "Unknown Dealer",
          phone: listing?.phone || "",
        };
      })
    : [];

  if (!session || !listings) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Logo size={72} />
        <div className="text-muted-foreground">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
        <Button
          onClick={() => navigate("/sessions")}
          variant="ghost"
          size="sm"
          className="mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Button>
        <h1 className="text-xl font-bold text-foreground">
          {session.model} {session.version}
        </h1>
        <p className="text-sm text-muted-foreground capitalize">
          {session.carType} • ZIP {session.zipCode} • {session.radiusMiles} mi
          radius
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <>
          <div className="bg-card px-4 py-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <StatCard label="Dealers" value={stats.totalListings} />
              <StatCard label="Calls" value={stats.totalCalls} />
              <StatCard label="Quotes" value={stats.totalQuotes} />
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Status Info */}
      <SessionStatus session={session} listings={listings} />

      {/* Content based on status */}
      {session.status === "draft" && sessionId && (
        <FetchDealers session={session} sessionId={sessionId as Id<"sessions">} />
      )}

      {session.status === "fetching" && (
        <div className="p-4 space-y-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching for dealers...</p>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      )}

      {(session.status === "ready" ||
        session.status === "calling" ||
        session.status === "completed") && sessionId && (
        <>
          <div className="p-4">
            <ListingsTable
              listings={listingsWithStatus as ListingType[]}
              sessionId={sessionId as Id<"sessions">}
            />
          </div>

          {/* Quotes Section */}
          {quotesWithDealerInfo.length > 0 && (
            <div className="p-4 pt-0">
              <h2 className="text-lg font-semibold mb-3">Received Quotes</h2>
              <QuoteDisplay quotes={quotesWithDealerInfo as any} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Component to show stats
const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="text-2xl font-bold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

// Component to show session status
const SessionStatus = ({
  session,
  listings,
}: {
  session: { status: string };
  listings: ListingType[];
}) => {
  const getStatusInfo = () => {
    switch (session.status) {
      case "draft":
        return {
          variant: "secondary" as const,
          text: "Ready to search for dealers",
        };
      case "fetching":
        return {
          variant: "default" as const,
          text: "Fetching dealer information...",
        };
      case "ready":
        return {
          variant: "default" as const,
          text: `Found ${listings.length} dealers. Select dealers to call.`,
        };
      case "calling":
        return {
          variant: "default" as const,
          text: "AI is calling selected dealers...",
        };
      case "completed":
        return {
          variant: "default" as const,
          text: "All calls completed. Review quotes.",
        };
      default:
        return {
          variant: "secondary" as const,
          text: session.status,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="mx-4 my-4">
      <Badge variant={statusInfo.variant} className="w-full justify-center py-2 text-sm">
        {statusInfo.text}
      </Badge>
    </div>
  );
};

// Component to fetch dealers (when status is draft)
const FetchDealers = ({
  session,
  sessionId,
}: {
  session: {
    model: string;
    version: string;
    radiusMiles: number;
    zipCode: string;
  };
  sessionId: Id<"sessions">;
}) => {
  const fetchDealers = useAction(api.actions.fetchDealers);
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchDealers = async () => {
    setIsFetching(true);
    try {
      toast.loading("Searching for dealers...", { id: "fetch-dealers" });

      const result = await fetchDealers({ sessionId });

      toast.success(
        `Found ${result.count} dealer${result.count !== 1 ? "s" : ""}!`,
        { id: "fetch-dealers" }
      );
    } catch (error) {
      console.error("Failed to fetch dealers:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch dealers. Please try again.",
        { id: "fetch-dealers" }
      );
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <div className="text-muted-foreground">
            <p className="font-semibold">Ready to find dealers?</p>
            <p className="text-sm mt-2">
              We'll search for all {session.model} {session.version} listings
              within {session.radiusMiles} miles of {session.zipCode}
            </p>
          </div>

          <Button
            onClick={handleFetchDealers}
            disabled={isFetching}
            className="w-full"
          >
            {isFetching ? "Searching..." : "Search for Dealers"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

