import { fetchWithNgrok } from './fetch-utils'

// Define the API response type
type ApiResponse<T> = {
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
type Pagination = {
	page: number
	limit: number
	total: number
}

// Users list response type
type UsersListResponse = {
	users: User[]
	pagination: Pagination
}

// Function to get all users with pagination and search
export async function getAllUsers(
	page = 1,
	limit = 25,
	query?: string,
): Promise<ApiResponse<UsersListResponse>> {
	try {
		// Build the URL with query parameters
		let url = `/users?page=${page}&limit=${limit}`
		if (query && query.trim() !== '') {
			url += `&query=${encodeURIComponent(query.trim())}`
		}

		const response = await fetchWithNgrok(url, {
			method: 'GET',
		})

		if (!response.ok) {
			throw new Error(`Failed to fetch users: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Error fetching users:', error)
		throw error
	}
}

// Function to toggle user's influencer status
export async function toggleUserInfluencerStatus(userId: number): Promise<ApiResponse<User>> {
	try {
		const response = await fetchWithNgrok(`/users/toggle-influencer/${userId}`, {
			method: 'PATCH',
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to update user influencer status')
		}

		return await response.json()
	} catch (error) {
		console.error('Error updating user influencer status:', error)
		throw error
	}
}
