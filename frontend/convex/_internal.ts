import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Check for completed calls that promised quotes but haven't received them yet
 * Create follow-up calls for dealers that are overdue
 */
export const checkQuoteFollowups = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // 1 hour in milliseconds

    // Get all calls that are completed, dealer promised a quote, and it's been more than 1 hour
    const allCalls = await ctx.db.query("calls").collect();

    const overdueCalls = allCalls.filter(
      (call) =>
        call.status === "completed" &&
        call.dealerPromisedQuote &&
        call.quoteDueAt &&
        call.quoteDueAt < now &&
        call.createdAt < oneHourAgo // Only follow up on calls older than 1 hour
    );

    if (overdueCalls.length === 0) {
      console.log("No overdue quote follow-ups needed");
      return { followUpsCreated: 0 };
    }

    let followUpsCreated = 0;

    for (const call of overdueCalls) {
      // Check if a quote was already received for this listing
      const existingQuote = await ctx.db
        .query("quotes")
        .withIndex("by_listing", (q) => q.eq("listingId", call.listingId))
        .first();

      if (existingQuote) {
        // Quote was received, no need for follow-up
        continue;
      }

      // Check if a follow-up call already exists for this listing
      const existingFollowUp = await ctx.db
        .query("calls")
        .withIndex("by_listing", (q) => q.eq("listingId", call.listingId))
        .filter((q) => q.neq(q.field("_id"), call._id))
        .filter((q) => q.gt(q.field("createdAt"), call.createdAt))
        .first();

      if (existingFollowUp) {
        // Follow-up already exists
        continue;
      }

      // Get the listing details
      const listing = await ctx.db.get(call.listingId);
      if (!listing) continue;

      // Get the session details
      const session = await ctx.db.get(call.sessionId);
      if (!session) continue;

      // Create a follow-up call
      const followUpScriptText = `Follow-up call to ${listing.dealerName}. Previous call indicated they would provide a quote for ${session.model} ${session.version}. Following up to request the quote.`;

      await ctx.db.insert("calls", {
        sessionId: call.sessionId,
        listingId: call.listingId,
        phone: call.phone,
        scriptText: followUpScriptText,
        status: "queued",
        dealerPromisedQuote: false, // Will be updated after call completes
        createdAt: now,
        updatedAt: now,
      });

      followUpsCreated++;
      console.log(`Created follow-up call for ${listing.dealerName}`);
    }

    console.log(`Created ${followUpsCreated} follow-up calls`);
    return { followUpsCreated };
  },
});
