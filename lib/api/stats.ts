import { fetchWithNgrok } from './fetch-utils'

// Define the API response type
type ApiResponse<T> = {
	statusCode: number
	status: string
	message: string
	data: T
}

// Server stats type
type ServerStats = {
	users: number
	admins: number
}

// Function to get server stats
export async function getServerStats(): Promise<ApiResponse<ServerStats>> {
	try {
		// Updated URL from /server-stats to /store-stats
		const response = await fetchWithNgrok(`/store-stats`)

		if (!response.ok) {
			throw new Error(`Failed to fetch store stats: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Error fetching store stats:', error)
		throw error
	}
}
