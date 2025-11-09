import { ConvexReactClient } from "convex/react";

// Initialize Convex client
const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "Missing VITE_CONVEX_URL environment variable. Run 'npx convex dev' to set it up."
  );
}

export const convex = new ConvexReactClient(convexUrl);
