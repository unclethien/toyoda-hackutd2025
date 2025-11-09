import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for calls that need follow-ups every 10 minutes
crons.interval(
  "check quote follow-ups",
  { minutes: 10 }, // Run every 10 minutes
  internal._internal.checkQuoteFollowups
);

export default crons;
