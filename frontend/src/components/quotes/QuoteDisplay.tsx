import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "../../lib/utils";
import { Award, Mail, User, DollarSign, Package, FileText } from "lucide-react";

interface Quote {
  _id: string;
  otdPrice: number;
  addOns: string[];
  notes: string;
  receivedVia: "email" | "manual";
  createdAt: number;
}

interface QuoteWithListing extends Quote {
  dealerName: string;
  phone: string;
}

interface QuoteDisplayProps {
  quotes: QuoteWithListing[];
}

export function QuoteDisplay({ quotes }: QuoteDisplayProps) {
  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No quotes received yet</p>
          <p className="text-sm mt-1">
            Quotes will appear here once dealers respond
          </p>
        </CardContent>
      </Card>
    );
  }

  // Find best quote
  const bestPrice = Math.min(...quotes.map((q) => q.otdPrice));

  // Sort quotes by price (best first)
  const sortedQuotes = [...quotes].sort((a, b) => a.otdPrice - b.otdPrice);

  return (
    <div className="space-y-3">
      {/* Best quote banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
        <Award className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-semibold text-green-900">Best Quote</p>
          <p className="text-sm text-green-700">
            {formatCurrency(bestPrice)} from {sortedQuotes[0].dealerName}
          </p>
        </div>
      </div>

      {/* Quote cards */}
      {sortedQuotes.map((quote) => (
        <QuoteCard
          key={quote._id}
          quote={quote}
          isBest={quote.otdPrice === bestPrice}
        />
      ))}
    </div>
  );
}

interface QuoteCardProps {
  quote: QuoteWithListing;
  isBest: boolean;
}

function QuoteCard({ quote, isBest }: QuoteCardProps) {
  return (
    <Card className={isBest ? "border-green-500 border-2" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {quote.dealerName}
              {isBest && (
                <Badge variant="default" className="bg-green-600">
                  <Award className="h-3 w-3 mr-1" />
                  Best Price
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{quote.phone}</p>
          </div>
          <Badge variant={quote.receivedVia === "email" ? "default" : "secondary"}>
            {quote.receivedVia === "email" ? (
              <>
                <Mail className="h-3 w-3 mr-1" />
                Email
              </>
            ) : (
              <>
                <User className="h-3 w-3 mr-1" />
                Manual
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Price */}
        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
          <DollarSign className="h-6 w-6" />
          {formatCurrency(quote.otdPrice)}
        </div>

        {/* Add-ons */}
        {quote.addOns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
              <Package className="h-4 w-4" />
              Included Add-ons
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quote.addOns.map((addOn, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {addOn}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {quote.notes && (
          <div className="bg-secondary/50 rounded-md p-3">
            <p className="text-sm text-muted-foreground">{quote.notes}</p>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">
          Received {new Date(quote.createdAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
