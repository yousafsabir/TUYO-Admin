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
