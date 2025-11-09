import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new call
export const create = mutation({
  args: {
    sessionId: v.id("sessions"),
    listingId: v.id("listings"),
    phone: v.string(),
    scriptText: v.string(),
    dealerPromisedQuote: v.boolean(),
    quoteDueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const callId = await ctx.db.insert("calls", {
      sessionId: args.sessionId,
      listingId: args.listingId,
      phone: args.phone,
      scriptText: args.scriptText,
      status: "queued",
      dealerPromisedQuote: args.dealerPromisedQuote,
      quoteDueAt: args.quoteDueAt,
      createdAt: now,
      updatedAt: now,
    });

    return callId;
  },
});

// Update call status
export const updateStatus = mutation({
  args: {
    id: v.id("calls"),
    status: v.union(
      v.literal("queued"),
      v.literal("dialing"),
      v.literal("connected"),
      v.literal("completed"),
      v.literal("failed")
    ),
    elevenLabsCallId: v.optional(v.string()),
    transcript: v.optional(v.string()),
    dealerPromisedQuote: v.optional(v.boolean()),
    quoteDueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: {
      status: "queued" | "dialing" | "connected" | "completed" | "failed";
      updatedAt: number;
      elevenLabsCallId?: string;
      transcript?: string;
      dealerPromisedQuote?: boolean;
      quoteDueAt?: number;
    } = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.elevenLabsCallId !== undefined) {
      updates.elevenLabsCallId = args.elevenLabsCallId;
    }

    if (args.transcript !== undefined) {
      updates.transcript = args.transcript;
    }

    if (args.dealerPromisedQuote !== undefined) {
      updates.dealerPromisedQuote = args.dealerPromisedQuote;
    }

    if (args.quoteDueAt !== undefined) {
      updates.quoteDueAt = args.quoteDueAt;
    }

    await ctx.db.patch(args.id, updates);
  },
});

// List all calls for a session
export const listBySession = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const calls = await ctx.db
      .query("calls")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();

    return calls;
  },
});

// Get call by listing ID
export const getByListing = query({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const call = await ctx.db
      .query("calls")
      .withIndex("by_listing", (q) => q.eq("listingId", args.listingId))
      .first();

    return call;
  },
});

// Get a single call
export const get = query({
  args: {
    id: v.id("calls"),
  },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.id);
    return call;
  },
});

// Get calls that are overdue for quotes
export const listOverdueQuotes = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all calls where dealer promised a quote and it's overdue
    const allCalls = await ctx.db.query("calls").collect();

    const overdueCalls = allCalls.filter(
      (call) =>
        call.dealerPromisedQuote &&
        call.quoteDueAt &&
        call.quoteDueAt < now &&
        call.status === "completed"
    );

    return overdueCalls;
  },
});

// Delete a call
export const remove = mutation({
  args: {
    id: v.id("calls"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
