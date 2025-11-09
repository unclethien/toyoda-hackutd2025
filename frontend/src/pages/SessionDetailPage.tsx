import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ArrowLeft, Phone, CheckCircle2, Circle } from "lucide-react";
import { formatCurrency, calculateSavings } from "../lib/utils";
import { useState } from "react";

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

  const stats = useQuery(
    api.sessions.getStats,
    sessionId ? { id: sessionId as Id<"sessions"> } : "skip"
  );

  if (!session || !listings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <button
          onClick={() => navigate("/sessions")}
          className="flex items-center gap-2 text-functional-gray hover:text-toyoda-red mb-3"
        >
          <ArrowLeft size={20} />
          Back to Sessions
        </button>
        <h1 className="text-xl font-bold text-functional-gray">
          {session.model} {session.version}
        </h1>
        <p className="text-sm text-gray-600 capitalize">
          {session.carType} • ZIP {session.zipCode} • {session.radiusMiles} mi
          radius
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <StatCard label="Dealers" value={stats.totalListings} />
            <StatCard label="Calls" value={stats.totalCalls} />
            <StatCard label="Quotes" value={stats.totalQuotes} />
          </div>
        </div>
      )}

      {/* Status Info */}
      <SessionStatus session={session} listings={listings} />

      {/* Content based on status */}
      {session.status === "draft" && <FetchDealers session={session} />}

      {session.status === "fetching" && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-toyoda-red mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for dealers...</p>
        </div>
      )}

      {(session.status === "ready" ||
        session.status === "calling" ||
        session.status === "completed") && (
        <DealersList listings={listings as Listing[]} status={session.status} />
      )}
    </div>
  );
};

// Component to show stats
const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="text-2xl font-bold text-functional-gray">{value}</div>
    <div className="text-xs text-gray-600">{label}</div>
  </div>
);

// Component to show session status
const SessionStatus = ({
  session,
  listings,
}: {
  session: { status: string };
  listings: Listing[];
}) => {
  const getStatusInfo = () => {
    switch (session.status) {
      case "draft":
        return {
          color: "bg-gray-100 text-gray-700",
          text: "Ready to search for dealers",
        };
      case "fetching":
        return {
          color: "bg-blue-100 text-blue-700",
          text: "Fetching dealer information...",
        };
      case "ready":
        return {
          color: "bg-green-100 text-green-700",
          text: `Found ${listings.length} dealers. Select dealers to call.`,
        };
      case "calling":
        return {
          color: "bg-yellow-100 text-yellow-700",
          text: "AI is calling selected dealers...",
        };
      case "completed":
        return {
          color: "bg-purple-100 text-purple-700",
          text: "All calls completed. Review quotes.",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700",
          text: session.status,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className={`mx-4 my-4 p-4 rounded-lg ${statusInfo.color} text-center font-semibold`}
    >
      {statusInfo.text}
    </div>
  );
};

// Component to fetch dealers (when status is draft)
const FetchDealers = ({
  session,
}: {
  session: {
    model: string;
    version: string;
    radiusMiles: number;
    zipCode: string;
  };
}) => {
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchDealers = async () => {
    setIsFetching(true);
    // TODO: Call backend action to fetch from CARFAX API
    // This will be implemented in Phase 4
    alert("Backend integration coming in Phase 4!");
    setIsFetching(false);
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg p-6 text-center space-y-4">
        <div className="text-gray-600">
          <p className="font-semibold">Ready to find dealers?</p>
          <p className="text-sm mt-2">
            We'll search for all {session.model} {session.version} listings
            within {session.radiusMiles} miles of {session.zipCode}
          </p>
        </div>

        <button
          onClick={handleFetchDealers}
          disabled={isFetching}
          className="w-full bg-toyoda-red text-white py-3 px-6 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {isFetching ? "Searching..." : "Search for Dealers"}
        </button>
      </div>
    </div>
  );
};

// Component to show dealers list and initiate calls
interface Listing {
  _id: string;
  dealerName: string;
  phone: string;
  address?: string;
  msrp: number;
  discountedPrice: number;
  mpg: number;
  distance?: number;
  selected: boolean;
}

const DealersList = ({
  listings,
  status,
}: {
  listings: Listing[];
  status: string;
}) => {
  const [selectedDealers, setSelectedDealers] = useState<Set<string>>(
    new Set()
  );

  const toggleDealer = (dealerId: string) => {
    const newSelected = new Set(selectedDealers);
    if (newSelected.has(dealerId)) {
      newSelected.delete(dealerId);
    } else {
      newSelected.add(dealerId);
    }
    setSelectedDealers(newSelected);
  };

  const handleInitiateCalls = async () => {
    if (selectedDealers.size === 0) {
      alert("Please select at least one dealer");
      return;
    }

    // TODO: Call backend action to initiate ElevenLabs calls
    // This will be implemented in Phase 5
    alert(
      `Will call ${selectedDealers.size} dealers (Phase 5 integration coming)`
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Action Button */}
      {status === "ready" && (
        <button
          onClick={handleInitiateCalls}
          disabled={selectedDealers.size === 0}
          className="w-full bg-toyoda-red text-white py-4 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50"
        >
          <Phone size={24} />
          Call {selectedDealers.size > 0 ? `${selectedDealers.size} ` : ""}
          Selected Dealers
        </button>
      )}

      {/* Dealers List */}
      <div className="space-y-3">
        {listings.map((listing) => (
          <DealerCard
            key={listing._id}
            listing={listing}
            isSelected={selectedDealers.has(listing._id)}
            onToggle={() => toggleDealer(listing._id)}
            isSelectable={status === "ready"}
          />
        ))}
      </div>
    </div>
  );
};

// Individual dealer card
interface DealerCardProps {
  listing: Listing;
  isSelected: boolean;
  onToggle: () => void;
  isSelectable: boolean;
}

const DealerCard = ({
  listing,
  isSelected,
  onToggle,
  isSelectable,
}: DealerCardProps) => {
  const savings = calculateSavings(listing.msrp, listing.discountedPrice);

  return (
    <div
      onClick={isSelectable ? onToggle : undefined}
      className={`bg-white rounded-lg p-4 border-2 transition-all ${
        isSelected ? "border-toyoda-red" : "border-gray-200"
      } ${isSelectable ? "cursor-pointer hover:shadow-md" : ""}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-functional-gray">
            {listing.dealerName}
          </h3>
          <p className="text-sm text-gray-600">{listing.phone}</p>
          {listing.address && (
            <p className="text-xs text-gray-500 mt-1">{listing.address}</p>
          )}
        </div>
        {isSelectable && (
          <div className="shrink-0">
            {isSelected ? (
              <CheckCircle2 size={24} className="text-toyoda-red" />
            ) : (
              <Circle size={24} className="text-gray-300" />
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">MSRP:</span>
          <span className="text-sm line-through text-gray-500">
            {formatCurrency(listing.msrp)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-functional-gray">
            Price:
          </span>
          <span className="text-lg font-bold text-toyoda-red">
            {formatCurrency(listing.discountedPrice)}
          </span>
        </div>
        {savings > 0 && (
          <div className="text-xs text-green-600 text-right">
            Save {savings}% ($
            {(listing.msrp - listing.discountedPrice).toLocaleString()})
          </div>
        )}
        <div className="flex justify-between items-center text-sm text-gray-600 pt-2 border-t border-gray-100">
          <span>MPG: {listing.mpg}</span>
          {listing.distance !== undefined && (
            <span className="text-xs text-gray-500">
              {listing.distance.toFixed(1)} mi away
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
