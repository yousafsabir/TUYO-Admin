import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function imageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg"

  // If it's already a full URL, return as is
  if (url.startsWith("http://") || url.startsWith("https://")|| url.startsWith("blob:")) {
    return url
  }

  // If it's a relative path, prepend your API base URL or CDN URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
}
