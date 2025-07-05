import { getAuthToken } from "./auth"

// Utility function to create a fetch request with the ngrok header
export async function fetchWithNgrok(url: string, options: RequestInit = {}) {
  // Ensure headers object exists
  const headers = options.headers || {}

  // Add the ngrok header
  const updatedHeaders = {
    ...headers,
    "ngrok-skip-browser-warning": "true",
  }

  // Return the fetch promise with updated headers
  return fetch(url, {
    ...options,
    headers: updatedHeaders,
  })
}

// Create headers with authorization token if available
export function createAuthHeaders(includeContentType = true): HeadersInit {
  const headers: HeadersInit = {
    "ngrok-skip-browser-warning": "true",
  }

  if (includeContentType) {
    headers["Content-Type"] = "application/json"
  }

  const token = getAuthToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}
