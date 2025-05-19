import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function imageUrl(url: string) {
  if (url && !url.match(/http/)) url = process.env.NEXT_PUBLIC_API_URL + url
  return url
}
