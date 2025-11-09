import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Record an incoming quote (from email or manual entry)
export const recordIncoming = mutation({
  args: {
    callId: v.id("calls"),
    listingId: v.id("listings"),
    sessionId: v.id("sessions"),
    otdPrice: v.number(),
    addOns: v.array(v.string()),
    notes: v.string(),
    receivedVia: v.union(v.literal("email"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const quoteId = await ctx.db.insert("quotes", {
      callId: args.callId,
      listingId: args.listingId,
      sessionId: args.sessionId,
      otdPrice: args.otdPrice,
      addOns: args.addOns,
      notes: args.notes,
      receivedVia: args.receivedVia,
      createdAt: now,
    });

    return quoteId;
  },
});

// Get quote by call ID
export const getByCall = query({
  args: {
    callId: v.id("calls"),
  },
  handler: async (ctx, args) => {
    const quote = await ctx.db
      .query("quotes")
      .withIndex("by_call", (q) => q.eq("callId", args.callId))
      .first();

    return quote;
  },
});

// Get quote by listing ID
export const getByListing = query({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const quote = await ctx.db
      .query("quotes")
      .withIndex("by_listing", (q) => q.eq("listingId", args.listingId))
      .first();

    return quote;
  },
});

// List all quotes for a session
export const listBySession = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();

    return quotes;
  },
});

// Get a single quote
export const get = query({
  args: {
    id: v.id("quotes"),
  },
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.id);
    return quote;
  },
});

// Update a quote
export const update = mutation({
  args: {
    id: v.id("quotes"),
    otdPrice: v.optional(v.number()),
    addOns: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: {
      otdPrice?: number;
      addOns?: string[];
      notes?: string;
    } = {};

    if (args.otdPrice !== undefined) {
      updates.otdPrice = args.otdPrice;
    }

    if (args.addOns !== undefined) {
      updates.addOns = args.addOns;
    }

    if (args.notes !== undefined) {
      updates.notes = args.notes;
    }

    await ctx.db.patch(args.id, updates);
  },
});

// Delete a quote
export const remove = mutation({
  args: {
    id: v.id("quotes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get quote statistics for a session
export const getSessionStats = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    if (quotes.length === 0) {
      return null;
    }

    const prices = quotes.map((q) => q.otdPrice);
    const avgPrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const emailQuotes = quotes.filter((q) => q.receivedVia === "email").length;
    const manualQuotes = quotes.filter(
      (q) => q.receivedVia === "manual"
    ).length;

    return {
      totalQuotes: quotes.length,
      avgPrice,
      minPrice,
      maxPrice,
      emailQuotes,
      manualQuotes,
    };
  },
});
