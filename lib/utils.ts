import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 1. The new helper function for the Wrapped component (fixes the error)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 2. Your existing function
export function getWrappedImageUrl(topic: string, winner: string, criticalBlow: string) {
  const params = new URLSearchParams();
  // Important: Encode parameters so special characters don't break the URL
  params.set('topic', topic);
  params.set('winner', winner);
  params.set('blow', criticalBlow);
  
  // Assuming your app is running on localhost:3000 for dev. 
  // In production, change this base URL.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/og/wrapped?${params.toString()}`;
}