import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

// Format date
export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

// Calculate time difference
export function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

// Calculate savings percentage
export function calculateSavings(
  msrp: number,
  discountedPrice: number
): number {
  if (msrp <= 0) return 0;
  return Math.round(((msrp - discountedPrice) / msrp) * 100);
}

// Generate call script
export function generateCallScript(params: {
  dealerName: string;
  carType: string;
  model: string;
  version: string;
  userName: string;
}): string {
  return `Hello, this is an automated call on behalf of ${params.userName}. 

I'm calling regarding the ${params.carType} ${params.model} ${params.version} that you have listed at ${params.dealerName}.

My client is very interested in this vehicle and would like to get your best out-the-door price quote including all fees, taxes, and any available incentives.

Could you please provide:
1. Your best out-the-door price
2. Any current promotions or dealer incentives
3. Expected delivery timeline if not in stock

Please send the quote to the contact information provided. Thank you for your time!`;
}
