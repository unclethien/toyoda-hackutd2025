import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Create a single listing
export const create = mutation({
  args: {
    sessionId: v.id("sessions"),
    dealerName: v.string(),
    phone: v.string(),
    address: v.optional(v.string()),
    msrp: v.number(),
    discountedPrice: v.number(),
    mpg: v.number(),
    distance: v.optional(v.number()),
    selected: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const id = await ctx.db.insert("listings", {
      sessionId: args.sessionId,
      dealerName: args.dealerName,
      phone: args.phone,
      address: args.address,
      msrp: args.msrp,
      discountedPrice: args.discountedPrice,
      mpg: args.mpg,
      distance: args.distance,
      selected: args.selected,
      createdAt: now,
    });

    return id;
  },
});

// List all listings for a session
export const listBySession = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();

    return listings;
  },
});

// Toggle selection status of a listing
export const toggleSelect = mutation({
  args: {
    id: v.id("listings"),
    selected: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      selected: args.selected,
    });
  },
});

// Bulk create listings for a session
export const bulkCreate = mutation({
  args: {
    sessionId: v.id("sessions"),
    listings: v.array(
      v.object({
        dealerName: v.string(),
        phone: v.string(),
        address: v.optional(v.string()),
        msrp: v.number(),
        discountedPrice: v.number(),
        mpg: v.number(),
        distance: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const listingIds: Id<"listings">[] = [];

    for (const listing of args.listings) {
      const id = await ctx.db.insert("listings", {
        sessionId: args.sessionId,
        dealerName: listing.dealerName,
        phone: listing.phone,
        address: listing.address,
        msrp: listing.msrp,
        discountedPrice: listing.discountedPrice,
        mpg: listing.mpg,
        distance: listing.distance,
        selected: false,
        createdAt: now,
      });
      listingIds.push(id);
    }

    return listingIds;
  },
});

// Get a single listing
export const get = query({
  args: {
    id: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.id);
    return listing;
  },
});

// Get selected listings for a session
export const listSelected = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_session_and_selected", (q) =>
        q.eq("sessionId", args.sessionId).eq("selected", true)
      )
      .collect();

    return listings;
  },
});

// Delete a listing
export const remove = mutation({
  args: {
    id: v.id("listings"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Bulk select/deselect listings
export const bulkToggleSelect = mutation({
  args: {
    ids: v.array(v.id("listings")),
    selected: v.boolean(),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.patch(id, { selected: args.selected });
    }
  },
});
