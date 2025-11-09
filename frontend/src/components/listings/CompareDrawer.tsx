import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, DollarSign, Gauge, Award } from "lucide-react";
import { formatCurrency, calculateSavings } from "../../lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";

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
}

interface CompareDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listings: Listing[];
}

export function CompareDrawer({ open, onOpenChange, listings }: CompareDrawerProps) {
  const selectedListings = listings.filter((l) => l.selected);

  // Find best values for highlighting
  const bestPrice = selectedListings.length > 0
    ? Math.min(...selectedListings.map((l) => l.discountedPrice))
    : 0;
  const bestMpg = selectedListings.length > 0
    ? Math.max(...selectedListings.map((l) => l.mpg))
    : 0;
  const bestDistance = selectedListings.length > 0
    ? Math.min(...selectedListings.map((l) => l.distance || Infinity))
    : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Compare Dealers</SheetTitle>
          <SheetDescription>
            Side-by-side comparison of {selectedListings.length} selected dealer
            {selectedListings.length !== 1 ? "s" : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {selectedListings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No dealers selected for comparison</p>
              <p className="text-sm mt-2">
                Select at least 2 dealers to compare their offers
              </p>
            </div>
          )}

          {selectedListings.length === 1 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Only 1 dealer selected</p>
              <p className="text-sm mt-2">
                Select at least one more dealer to compare
              </p>
            </div>
          )}

          {selectedListings.length >= 2 &&
            selectedListings.map((listing) => (
              <DealerComparisonCard
                key={listing._id}
                listing={listing}
                isBestPrice={listing.discountedPrice === bestPrice}
                isBestMpg={listing.mpg === bestMpg}
                isBestDistance={
                  listing.distance !== undefined && listing.distance === bestDistance
                }
              />
            ))}
        </div>

        {/* Summary Section */}
        {selectedListings.length >= 2 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-4">Comparison Summary</h3>
            <div className="grid grid-cols-1 gap-3">
              <SummaryItem
                icon={<DollarSign className="h-4 w-4" />}
                label="Price Range"
                value={`${formatCurrency(
                  Math.min(...selectedListings.map((l) => l.discountedPrice))
                )} - ${formatCurrency(
                  Math.max(...selectedListings.map((l) => l.discountedPrice))
                )}`}
              />
              <SummaryItem
                icon={<Gauge className="h-4 w-4" />}
                label="MPG Range"
                value={`${Math.min(...selectedListings.map((l) => l.mpg))} - ${Math.max(
                  ...selectedListings.map((l) => l.mpg)
                )} MPG`}
              />
              <SummaryItem
                icon={<MapPin className="h-4 w-4" />}
                label="Average Distance"
                value={
                  selectedListings.filter((l) => l.distance).length > 0
                    ? `${(
                        selectedListings.reduce(
                          (sum, l) => sum + (l.distance || 0),
                          0
                        ) / selectedListings.filter((l) => l.distance).length
                      ).toFixed(1)} mi`
                    : "—"
                }
              />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Individual dealer comparison card
interface DealerComparisonCardProps {
  listing: Listing;
  isBestPrice: boolean;
  isBestMpg: boolean;
  isBestDistance: boolean;
}

function DealerComparisonCard({
  listing,
  isBestPrice,
  isBestMpg,
  isBestDistance,
}: DealerComparisonCardProps) {
  const savings = calculateSavings(listing.msrp, listing.discountedPrice);

  return (
    <Card className={isBestPrice ? "border-primary border-2" : ""}>
      <CardContent className="p-4">
        {/* Dealer Name */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg">{listing.dealerName}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Phone className="h-3 w-3" />
              {listing.phone}
            </div>
            {listing.address && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {listing.address}
              </div>
            )}
          </div>
          {isBestPrice && (
            <Badge variant="default" className="bg-green-600">
              <Award className="h-3 w-3 mr-1" />
              Best Price
            </Badge>
          )}
        </div>

        {/* Pricing */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">MSRP:</span>
            <span className="text-sm line-through text-muted-foreground">
              {formatCurrency(listing.msrp)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Price:</span>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {formatCurrency(listing.discountedPrice)}
              </div>
              {savings > 0 && (
                <div className="text-xs text-green-600">
                  Save {savings}% (${(listing.msrp - listing.discountedPrice).toLocaleString()})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <MetricItem
            label="MPG"
            value={listing.mpg.toString()}
            isBest={isBestMpg}
          />
          <MetricItem
            label="Distance"
            value={listing.distance ? `${listing.distance.toFixed(1)} mi` : "—"}
            isBest={isBestDistance}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Metric item with best indicator
interface MetricItemProps {
  label: string;
  value: string;
  isBest: boolean;
}

function MetricItem({ label, value, isBest }: MetricItemProps) {
  return (
    <div className="text-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-sm font-semibold ${isBest ? "text-green-600" : ""}`}>
        {value}
        {isBest && <span className="ml-1">★</span>}
      </div>
    </div>
  );
}

// Summary item
interface SummaryItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function SummaryItem({ icon, label, value }: SummaryItemProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <span className="text-muted-foreground">{label}:</span>
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
