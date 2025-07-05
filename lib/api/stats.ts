import { fetchWithNgrok, createAuthHeaders } from "./fetch-utils"
import { API_BASE_URL } from "./config"

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
