import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert bytes to human-readable file size format
 * @param bytes - Number of bytes to convert
 * @returns Formatted string (e.g., "1.5 MB", "250 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const divisor = 1024;
  let size = bytes;
  let unitIndex = 0;

  while (size >= divisor && unitIndex < units.length - 1) {
    size /= divisor;
    unitIndex++;
  }

  // Round to 2 decimal places
  const rounded = Math.round(size * 100) / 100;
  return `${rounded} ${units[unitIndex]}`;
}

/**
 * Format date to short format
 * @param date - Date object or ISO string
 * @returns Formatted string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date and time to short format
 * @param date - Date object or ISO string
 * @returns Formatted string (e.g., "Jan 15, 2024 10:30 AM")
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns true if copy was successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}
