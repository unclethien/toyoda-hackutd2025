import { z } from "zod";

// Session validation schemas
export const SessionFormSchema = z.object({
  carType: z.string().min(1, "Car type is required"),
  model: z.string().min(1, "Model is required"),
  version: z.string().min(1, "Version is required"),
  zipCode: z.string().regex(/^\d{5}$/, "Must be a valid 5-digit ZIP code"),
  radiusMiles: z
    .number()
    .min(1)
    .max(500, "Radius must be between 1 and 500 miles"),
});

export const SessionStatusSchema = z.enum([
  "draft",
  "fetching",
  "ready",
  "calling",
  "completed",
]);

// Listing validation schemas
export const ListingSchema = z.object({
  dealerId: z.string().min(1),
  dealerName: z.string().min(1),
  phoneNumber: z.string().regex(/^\+?1?\d{10,}$/, "Invalid phone number"),
  msrp: z.number().positive(),
  discountedPrice: z.number().positive(),
  mpgCity: z.number().positive(),
  mpgHighway: z.number().positive(),
  availability: z.enum(["in-stock", "incoming"]),
  estimatedArrival: z.string().optional(),
});

export const ListingInputSchema = z.object({
  sessionId: z.string().min(1),
  dealerId: z.string().min(1),
  dealerName: z.string().min(1),
  phoneNumber: z.string(),
  msrp: z.number().positive(),
  discountedPrice: z.number().positive(),
  mpgCity: z.number().positive(),
  mpgHighway: z.number().positive(),
  availability: z.enum(["in-stock", "incoming"]),
  estimatedArrival: z.string().optional(),
  selected: z.boolean().default(false),
});

// Call validation schemas
export const CallStatusSchema = z.enum([
  "queued",
  "dialing",
  "connected",
  "completed",
  "failed",
]);

export const CallSchema = z.object({
  sessionId: z.string().min(1),
  listingId: z.string().min(1),
  phoneNumber: z.string(),
  scriptText: z.string().min(10, "Script must be at least 10 characters"),
  elevenLabsCallId: z.string().optional(),
  status: CallStatusSchema,
  dealerPromisedQuote: z.boolean(),
  quoteDueAt: z.number().optional(),
  transcript: z.string().optional(),
});

export const CallInputSchema = z.object({
  sessionId: z.string().min(1),
  listingId: z.string().min(1),
  phoneNumber: z.string(),
  scriptText: z.string().min(10),
  dealerPromisedQuote: z.boolean().default(false),
  quoteDueAt: z.number().optional(),
});

// Quote validation schemas
export const QuoteSchema = z.object({
  callId: z.string().min(1),
  listingId: z.string().min(1),
  sessionId: z.string().min(1),
  otdPrice: z.number().positive("Out-the-door price must be positive"),
  addOns: z.array(z.string()),
  notes: z.string(),
  receivedVia: z.enum(["email", "manual"]),
});

export const QuoteInputSchema = z.object({
  callId: z.string().min(1),
  listingId: z.string().min(1),
  sessionId: z.string().min(1),
  otdPrice: z.number().positive(),
  addOns: z.array(z.string()).default([]),
  notes: z.string().default(""),
  receivedVia: z.enum(["email", "manual"]),
});

// Type exports for TypeScript
export type SessionFormInput = z.infer<typeof SessionFormSchema>;
export type SessionStatus = z.infer<typeof SessionStatusSchema>;
export type Listing = z.infer<typeof ListingSchema>;
export type ListingInput = z.infer<typeof ListingInputSchema>;
export type CallStatus = z.infer<typeof CallStatusSchema>;
export type Call = z.infer<typeof CallSchema>;
export type CallInput = z.infer<typeof CallInputSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type QuoteInput = z.infer<typeof QuoteInputSchema>;
