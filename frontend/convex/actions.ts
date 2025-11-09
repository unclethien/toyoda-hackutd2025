// filepath: /Users/thiennguyen/Documents/GitHub/hackutd2025/frontend/convex/actions.ts
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import _ from "lodash";

interface SearchArea {
  zip: string;
  radius: number;
  dynamicRadius: boolean;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  dynamicRadii: number[];
}

interface Dealer {
  carfaxId: string;
  dealerInventoryUrl: string;
  cfxMicrositeUrl: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  latitude: string;
  longitude: string;
  dealerAverageRating: number;
  dealerReviewComments: string;
  dealerReviewDate: string;
  dealerReviewReviewer: string;
  dealerReviewRating: number;
  dealerReviewCount: number;
  ddcValue: number;
  dealerBadgingExperience: string;
}

interface MonthlyPaymentEstimate {
  price: number;
  downPaymentPercent: number;
  interestRate: number;
  termInMonths: number;
  loanAmount: number;
  downPaymentAmount: number;
  monthlyPayment: number;
}

interface ListingImages {
  baseUrl: string;
  large: string[];
  medium: string[];
  small: string[];
  firstPhoto: {
    large: string;
    medium: string;
    small: string;
  };
}

interface Listing {
  dealer: Dealer;
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  subTrim: string;
  topOptions: string[];
  mileage: number;
  listPrice: number;
  currentPrice: number;
  monthlyPaymentEstimate: MonthlyPaymentEstimate;
  exteriorColor: string;
  interiorColor: string;
  engine: string;
  displacement: string;
  drivetype: string;
  transmission: string;
  fuel: string;
  mpgCity: number;
  mpgHighway: number;
  bodytype: string;
  vehicleCondition: string;
  cabType: string;
  bedLength: string;
  followCount: number;
  stockNumber: string;
  imageCount: number;
  images: ListingImages;
  firstSeen: string;
  distanceToDealer: number;
  recordType: string;
  dealerType: string;
  advantage: boolean;
  vdpUrl: string;
  sortScore: number;
  baseScore: number;
  tpCostPerVdp: number;
  atomOtherOptions: string[];
  atomTopOptions: string[];
  tpRetentionScore: number;
  dealerBadgingExperience: string;
  msrp: number;
  mpgCombined: number;
  atomMake: string;
  atomModel: string;
  atomTrim: string;
}

interface BackendResponse {
  searchArea: SearchArea;
  listings: Listing[];
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
      // Convex runs in Docker, so use host.docker.internal to access host services
      // This works on Docker Desktop (Mac/Windows). On Linux, use the host's IP address.
      const backendUrl = "http://host.docker.internal:8080";
      const params = new URLSearchParams({
        zip: session.zipCode,
        radius: String(session.radiusMiles ?? ""),
        model: session.model ?? "",
      });

      const requestUrl = `${backendUrl}/api/sellers?${params.toString()}`;
      console.log("Fetching dealers from:", requestUrl);

      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details");
        console.error("Backend request failed:", {
          url: requestUrl,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(
          `Backend error: ${response.status} ${response.statusText} - ${errorText.substring(0, 100)}`
        );
      }

      const data = (await response.json()) as BackendResponse;

      // 4. Validate response
      if (!data.listings || !Array.isArray(data.listings)) {
        throw new Error("Invalid response from backend");
      }

      // 5. Filter out listings missing required fields and insert valid ones
      const listingIds: Id<"listings">[] = [];
      for (const dealer of data.listings) {
        // Skip listings that don't have required fields or have invalid prices
        if (!dealer.msrp || !dealer.dealer?.name || !dealer.dealer?.phone || !dealer.currentPrice || dealer.currentPrice === 0) {
          console.log("Skipping listing due to missing required fields or invalid price:", dealer);
          continue;
        }

        try {
          const listingId = await ctx.runMutation(api.listings.create, {
            sessionId: args.sessionId,
            dealerName: dealer.dealer.name,
            phone: dealer.dealer.phone,
            address: dealer.dealer.address || "",
            msrp: dealer.msrp,
            discountedPrice: dealer.currentPrice,
            mpg: dealer.mpgCombined || 0,
            distance: dealer.distanceToDealer || 0,
            selected: false,
            imageUrls: dealer.images?.large || [],
            link: dealer.vdpUrl || "",
          });
          listingIds.push(listingId);
        } catch (error) {
          // Log but don't fail the entire batch if one listing fails
          console.error("Failed to create listing:", error, dealer);
        }
      }

      // 6. Update session status to "ready"
      await ctx.runMutation(api.sessions.updateStatus, {
        id: args.sessionId,
        status: "ready",
      });

      return {
        success: true,
        count: listingIds.length,
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

      // 5. Call Go backend (which proxies to Python agent server)
      // Convex runs in Docker, so use host.docker.internal to access host services
      const backendUrl = "http://host.docker.internal:8080";
      const response = await fetch(`${backendUrl}/api/calls/submit`, {
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
