import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new session
export const create = mutation({
  args: {
    userId: v.string(),
    carType: v.string(),
    model: v.string(),
    version: v.string(),
    zipCode: v.string(),
    radiusMiles: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      carType: args.carType,
      model: args.model,
      version: args.version,
      zipCode: args.zipCode,
      radiusMiles: args.radiusMiles,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    return sessionId;
  },
});

// List all sessions for a user
export const listMine = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return sessions;
  },
});

// Get a single session by ID
export const get = query({
  args: {
    id: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    return session;
  },
});

// Alias for get (used by actions)
export const getById = query({
  args: {
    id: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    return session;
  },
});

// Update session status
export const updateStatus = mutation({
  args: {
    id: v.id("sessions"),
    status: v.union(
      v.literal("draft"),
      v.literal("fetching"),
      v.literal("ready"),
      v.literal("calling"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Delete a session
export const remove = mutation({
  args: {
    id: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get session statistics
export const getStats = query({
  args: {
    id: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    if (!session) return null;

    // Get listing counts
    const allListings = await ctx.db
      .query("listings")
      .withIndex("by_session", (q) => q.eq("sessionId", args.id))
      .collect();

    const selectedListings = allListings.filter((l) => l.selected);

    // Get call counts
    const allCalls = await ctx.db
      .query("calls")
      .withIndex("by_session", (q) => q.eq("sessionId", args.id))
      .collect();

    const completedCalls = allCalls.filter((c) => c.status === "completed");
    const failedCalls = allCalls.filter((c) => c.status === "failed");

    // Get quote count
    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_session", (q) => q.eq("sessionId", args.id))
      .collect();

    return {
      totalListings: allListings.length,
      selectedListings: selectedListings.length,
      totalCalls: allCalls.length,
      completedCalls: completedCalls.length,
      failedCalls: failedCalls.length,
      totalQuotes: quotes.length,
    };
  },
});
