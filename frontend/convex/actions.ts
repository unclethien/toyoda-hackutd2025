// filepath: /Users/thiennguyen/Documents/GitHub/hackutd2025/frontend/convex/actions.ts
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// Types for the backend response
interface DealerResponse {
  dealerName: string;
  phone: string;
  address?: string;
  msrp: number;
  discountedPrice: number;
  mpg: number;
  distance?: number;
}

interface BackendResponse {
  success: boolean;
  dealers: DealerResponse[];
  count: number;
  message: string;
}

/**
 * Fetch dealers from Go backend (CARFAX API) and populate listings
 */
export const fetchDealers = action({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    count: number;
    listingIds: Id<"listings">[];
  }> => {
    try {
      // 1. Get session data
      const session = await ctx.runQuery(api.sessions.getById, {
        id: args.sessionId,
      });

      if (!session) {
        throw new Error("Session not found");
      }

      // 2. Update session status to "fetching"
      await ctx.runMutation(api.sessions.updateStatus, {
        id: args.sessionId,
        status: "fetching",
      });

      // 3. Call Go backend
      // Note: Convex environment variables are configured via `npx convex env set`
      const backendUrl = "http://localhost:8080";
      const response = await fetch(`${backendUrl}/api/dealers/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          make: session.carType.split(" ")[0], // Extract make from "Toyota RAV4"
          model: session.model,
          version: session.version,
          zipCode: session.zipCode,
          radiusMiles: session.radiusMiles,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Backend error: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as BackendResponse;

      // 4. Validate response
      if (!data.success || !data.dealers || !Array.isArray(data.dealers)) {
        throw new Error("Invalid response from backend");
      }

      // 5. Insert dealers as listings
      const listingIds: Id<"listings">[] = [];
      for (const dealer of data.dealers) {
        const listingId = await ctx.runMutation(api.listings.create, {
          sessionId: args.sessionId,
          dealerName: dealer.dealerName,
          phone: dealer.phone,
          address: dealer.address || "",
          msrp: dealer.msrp,
          discountedPrice: dealer.discountedPrice || dealer.msrp,
          mpg: dealer.mpg || 0,
          distance: dealer.distance || 0,
          selected: false,
        });
        listingIds.push(listingId);
      }

      // 6. Update session status to "ready"
      await ctx.runMutation(api.sessions.updateStatus, {
        id: args.sessionId,
        status: "ready",
      });

      return {
        success: true,
        count: data.dealers.length,
        listingIds,
      };
    } catch (error) {
      // Update session status to "draft" on error
      await ctx.runMutation(api.sessions.updateStatus, {
        id: args.sessionId,
        status: "draft",
      });

      console.error("Failed to fetch dealers:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch dealers"
      );
    }
  },
});
