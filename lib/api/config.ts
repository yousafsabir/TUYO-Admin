// Centralized API configuration
export const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`

// Helper function to build API endpoints
function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
}
