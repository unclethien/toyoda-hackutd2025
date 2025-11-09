import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DollarSign, Plus, X } from "lucide-react";

interface QuoteRecordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callId: Id<"calls">;
  listingId: Id<"listings">;
  sessionId: Id<"sessions">;
  dealerName: string;
}

export function QuoteRecordForm({
  open,
  onOpenChange,
  callId,
  listingId,
  sessionId,
  dealerName,
}: QuoteRecordFormProps) {
  const [otdPrice, setOtdPrice] = useState("");
  const [addOns, setAddOns] = useState<string[]>([]);
  const [currentAddOn, setCurrentAddOn] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recordQuote = useMutation(api.quotes.recordIncoming);

  const handleAddAddOn = () => {
    if (currentAddOn.trim()) {
      setAddOns([...addOns, currentAddOn.trim()]);
      setCurrentAddOn("");
    }
  };

  const handleRemoveAddOn = (index: number) => {
    setAddOns(addOns.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(otdPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    try {
      await recordQuote({
        callId,
        listingId,
        sessionId,
        otdPrice: price,
        addOns,
        notes: notes.trim(),
        receivedVia: "manual",
      });

      toast.success(`Quote from ${dealerName} recorded successfully!`);

      // Reset form
      setOtdPrice("");
      setAddOns([]);
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to record quote:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to record quote. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Quote</DialogTitle>
          <DialogDescription>
            Enter the quote details from {dealerName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* OTD Price */}
          <div className="space-y-2">
            <Label htmlFor="otdPrice">Out-the-Door Price *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="otdPrice"
                type="number"
                step="0.01"
                placeholder="35000.00"
                value={otdPrice}
                onChange={(e) => setOtdPrice(e.target.value)}
                className="pl-9"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Total price including taxes, fees, and dealer charges
            </p>
          </div>

          {/* Add-ons */}
          <div className="space-y-2">
            <Label htmlFor="addOn">Add-ons (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="addOn"
                type="text"
                placeholder="e.g., Extended warranty, Window tinting"
                value={currentAddOn}
                onChange={(e) => setCurrentAddOn(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAddOn();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddAddOn}
                disabled={!currentAddOn.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Add-ons list */}
            {addOns.length > 0 && (
              <div className="space-y-1 mt-2">
                {addOns.map((addOn, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-secondary px-3 py-2 rounded-md text-sm"
                  >
                    <span>{addOn}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAddOn(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this quote..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Quote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
