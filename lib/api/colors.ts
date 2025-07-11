import { fetchWithNgrok } from './fetch-utils'

// Define the API response type
type ApiResponse<T> = {
	statusCode: number
	status: string
	message: string
	data: T
}

// Color type - [name, hexCode]
export type Color = [string, string]

// Color creation data type
type CreateColorData = {
	name: string
	code: string
}

// Color update data type
type UpdateColorData = {
	name: string
	newName: string
	code: string
}

// Color delete data type
type DeleteColorData = {
	name: string
}

// Function to get all colors
export async function getAllColors(): Promise<ApiResponse<Color[]>> {
	try {
		const response = await fetchWithNgrok(`/store-config/colors`)

		if (!response.ok) {
			throw new Error(`Failed to fetch colors: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Error fetching colors:', error)
		throw error
	}
}

// Function to create a new color
export async function createColor(data: CreateColorData): Promise<ApiResponse<Color>> {
	try {
		const response = await fetchWithNgrok(`/store-config/colors`, {
			method: 'POST',
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to create color')
		}

		return await response.json()
	} catch (error) {
		console.error('Error creating color:', error)
		throw error
	}
}

// Function to update a color
export async function updateColor(data: UpdateColorData): Promise<ApiResponse<Color>> {
	try {
		const response = await fetchWithNgrok(`/store-config/colors`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to update color')
		}

		return await response.json()
	} catch (error) {
		console.error('Error updating color:', error)
		throw error
	}
}

// Function to delete a color
export async function deleteColor(data: DeleteColorData): Promise<ApiResponse<null>> {
	try {
		const response = await fetchWithNgrok(`/store-config/colors`, {
			method: 'DELETE',
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to delete color')
		}

		return await response.json()
	} catch (error) {
		console.error('Error deleting color:', error)
		throw error
	}
}
