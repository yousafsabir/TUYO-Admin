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

// User type
export type User = {
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
  avatarUrl: string
  isInfluencer: boolean
}

// Pagination type
export type Pagination = {
  page: number
  limit: number
  total: number
}

// Users list response type
export type UsersListResponse = {
  users: User[]
  pagination: Pagination
}

// Function to get all users with pagination and search
export async function getAllUsers(page = 1, limit = 25, query?: string): Promise<ApiResponse<UsersListResponse>> {
  try {
    // Build the URL with query parameters
    let url = `${API_BASE_URL}/users?page=${page}&limit=${limit}`
    if (query && query.trim() !== "") {
      url += `&query=${encodeURIComponent(query.trim())}`
    }

    const response = await fetchWithNgrok(url, {
      headers: createAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

// Function to toggle user's influencer status
export async function toggleUserInfluencerStatus(userId: number): Promise<ApiResponse<User>> {
  try {
    const response = await fetchWithNgrok(`${API_BASE_URL}/users/toggle-influencer/${userId}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
      throw new Error(errorData.message || "Failed to update user influencer status")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating user influencer status:", error)
    throw error
  }
}
