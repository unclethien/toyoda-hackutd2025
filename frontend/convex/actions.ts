// filepath: /Users/thiennguyen/Documents/GitHub/hackutd2025/frontend/convex/actions.ts
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import _ from "lodash";

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
      const backendUrl = "https://unsymptomatic-dacia-tribal.ngrok-free.dev";
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

// Types for ElevenLabs agent server
interface DealerQuery {
  make: string;
  model: string;
  year: number;
  zipcode: string;
  dealer_name: string;
  msrp: number;
  listing_price: number;
  phone_number: string;
  user_id: string;
}

/**
 * Initiate batch calls via ElevenLabs agent server
 */
export const initiateBatchCalls = action({
  args: {
    sessionId: v.id("sessions"),
    listingIds: v.array(v.id("listings")),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    callCount: number;
    callIds: Id<"calls">[];
  }> => {
    try {
      // 1. Get session data
      const session = await ctx.runQuery(api.sessions.getById, {
        id: args.sessionId,
      });

      if (!session) {
        throw new Error("Session not found");
      }

      // 2. Get listings data
      const listings = await Promise.all(
        args.listingIds.map((id) =>
          ctx.runQuery(api.listings.get, { id })
        )
      );

      // Filter out nulls
      const validListings = listings.filter((l) => l !== null);

      if (validListings.length === 0) {
        throw new Error("No valid listings found");
      }

      // 3. Update session status to "calling"
      await ctx.runMutation(api.sessions.updateStatus, {
        id: args.sessionId,
        status: "calling",
      });

      // 4. Transform listings to DealerQuery format
      const dealerQueries: DealerQuery[] = validListings.map((listing) => ({
        make: session.carType.split(" ")[0], // e.g., "Toyota" from "Toyota RAV4"
        model: session.model,
        year: 2015, // parseInt(session.year), // Assuming version contains year info
        zipcode: session.zipCode,
        dealer_name: listing!.dealerName,
        msrp: listing!.msrp,
        listing_price: listing!.discountedPrice,
        phone_number: _.sample(["+19452740673", "+19727836556", "+12406601769"]),
        user_id: session.userId,
      }));

      // 5. Call Python agent server
      const agentServerUrl = "https://unsymptomatic-dacia-tribal.ngrok-free.dev"; // TODO: Move to env var
      const response = await fetch(`${agentServerUrl}/api/calls/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dealerQueries),
      });

      if (!response.ok) {
        throw new Error(
          `Agent server error: ${response.status} ${response.statusText}`
        );
      }

      // Parse response (currently unused, but available for future logging/tracking)
      await response.json();

      // 6. Create call records in database
      const callIds: Id<"calls">[] = [];
      for (const listing of validListings) {
        const callId = await ctx.runMutation(api.calls.create, {
          sessionId: args.sessionId,
          listingId: listing!._id,
          phone: listing!.phone,
          scriptText: `Calling ${listing!.dealerName} for ${session.model} ${session.version}`,
          dealerPromisedQuote: false,
        });
        callIds.push(callId);
      }

      return {
        success: true,
        callCount: validListings.length,
        callIds,
      };
    } catch (error) {
      // Update session status back to "ready" on error
      await ctx.runMutation(api.sessions.updateStatus, {
        id: args.sessionId,
        status: "ready",
      });

      console.error("Failed to initiate batch calls:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to initiate batch calls"
      );
    }
  },
});
