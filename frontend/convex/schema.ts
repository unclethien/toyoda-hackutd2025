import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    userId: v.string(), // Auth0 user ID
    carType: v.string(), // "sedan", "suv", etc.
    model: v.string(),
    version: v.string(),
    zipCode: v.string(),
    radiusMiles: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("fetching"),
      v.literal("ready"),
      v.literal("calling"),
      v.literal("completed")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  listings: defineTable({
    sessionId: v.id("sessions"),
    dealerName: v.string(),
    phone: v.string(),
    address: v.optional(v.string()),
    msrp: v.number(),
    discountedPrice: v.number(),
    mpg: v.number(),
    distance: v.optional(v.number()),
    selected: v.boolean(),
    createdAt: v.number(),
    imageUrls: v.optional(v.array(v.string())),
    link: v.optional(v.string()),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_and_selected", ["sessionId", "selected"]),

  calls: defineTable({
    sessionId: v.id("sessions"),
    listingId: v.id("listings"),
    phone: v.string(),
    scriptText: v.string(),
    elevenLabsCallId: v.optional(v.string()),
    status: v.union(
      v.literal("queued"),
      v.literal("dialing"),
      v.literal("connected"),
      v.literal("completed"),
      v.literal("failed")
    ),
    dealerPromisedQuote: v.boolean(),
    quoteDueAt: v.optional(v.number()),
    transcript: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_listing", ["listingId"])
    .index("by_status", ["status"])
    .index("by_quote_due", ["quoteDueAt"]),

  quotes: defineTable({
    callId: v.id("calls"),
    listingId: v.id("listings"),
    sessionId: v.id("sessions"),
    otdPrice: v.number(), // Out-the-door price
    addOns: v.array(v.string()),
    notes: v.string(),
    receivedVia: v.union(v.literal("email"), v.literal("manual")),
    createdAt: v.number(),
  })
    .index("by_call", ["callId"])
    .index("by_listing", ["listingId"])
    .index("by_session", ["sessionId"]),
});
