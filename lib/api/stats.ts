import { fetchWithNgrok } from "./fetch-utils"
import { createAuthHeaders } from "./auth"

// Create the base API URL with the /api/v1 prefix
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`

// Define the API response type
export type ApiResponse<T> = {
  statusCode: number
  status: string
  message: string
  data: T
}

// Server stats type
export type ServerStats = {
  users: number
  admins: number
}

// Function to get server stats
export async function getServerStats(): Promise<ApiResponse<ServerStats>> {
  try {
    // Updated URL from /server-stats to /store-stats
    const response = await fetchWithNgrok(`${API_BASE_URL}/store-stats`, {
      headers: createAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch store stats: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching store stats:", error)
    throw error
  }
}
