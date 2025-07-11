import { fetchWithNgrok } from './fetch-utils'

// Define the API response type
type ApiResponse<T> = {
	statusCode: number
	status: string
	message: string
	data: T
}

// Brand type
export type Brand = {
	name: string
	imageUrl: string
}

// Brand creation data type
type CreateBrandData = {
	name: string
	image: File
}

// Brand update data type
type UpdateBrandData = {
	name: string
	newName: string
}

// Brand delete data type
type DeleteBrandData = {
	name: string
}

// Function to get all brands
export async function getAllBrands(): Promise<ApiResponse<Brand[]>> {
	try {
		const response = await fetchWithNgrok(`/store-config/brands`)

		if (!response.ok) {
			throw new Error(`Failed to fetch brands: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Error fetching brands:', error)
		throw error
	}
}

// Function to create a new brand
export async function createBrand(data: CreateBrandData): Promise<ApiResponse<Brand>> {
	try {
		const formData = new FormData()
		formData.append('name', data.name)
		formData.append('image', data.image)

		const response = await fetchWithNgrok(`/store-config/brands`, {
			method: 'POST',
			headers: { 'Content-Type': 'remove' },
			body: formData,
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to create brand')
		}

		return await response.json()
	} catch (error) {
		console.error('Error creating brand:', error)
		throw error
	}
}

// Function to update a brand
export async function updateBrand(data: UpdateBrandData): Promise<ApiResponse<Brand>> {
	try {
		const response = await fetchWithNgrok(`/store-config/brands`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to update brand')
		}

		return await response.json()
	} catch (error) {
		console.error('Error updating brand:', error)
		throw error
	}
}

// Function to delete a brand
export async function deleteBrand(data: DeleteBrandData): Promise<ApiResponse<null>> {
	try {
		const response = await fetchWithNgrok(`/store-config/brands`, {
			method: 'DELETE',
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to delete brand')
		}

		return await response.json()
	} catch (error) {
		console.error('Error deleting brand:', error)
		throw error
	}
}
