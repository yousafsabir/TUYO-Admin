import { fetchWithNgrok, createAuthHeaders } from './fetch-utils'

// Define the API response type
type ApiResponse<T> = {
	statusCode: number
	status: string
	message: string
	data: T
}

// Categories and subcategories structure
type CategoryData = {
	id: number
	subcategories: [string, string][] // [name, iconKey]
}

type CategoriesSubcategories = {
	[categoryName: string]: CategoryData
}

// Category type
type Category = {
	name: string
	subcategories: string[]
}

// Category creation data type
type CreateCategoryData = {
	name: string
}

// Category update data type
type UpdateCategoryData = {
	name: string
	newName: string
}

// Category delete data type
type DeleteCategoryData = {
	name: string
}

// Subcategory creation data type
type CreateSubcategoryData = {
	categoryId: number
	name: string
	iconKey: string
}

// Subcategory update data type
type UpdateSubcategoryData = {
	categoryId: number
	name: string
	newName: string
	iconKey: string
}

// Subcategory delete data type
type DeleteSubcategoryData = {
	categoryId: number
	name: string
}

// Function to get all categories and subcategories
export async function getAllCategoriesSubcategories(): Promise<
	ApiResponse<CategoriesSubcategories>
> {
	try {
		const response = await fetchWithNgrok('/store-config/categories-subcategories')

		if (!response.ok) {
			throw new Error(`Failed to fetch categories and subcategories: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Error fetching categories and subcategories:', error)
		throw error
	}
}

// Function to create a new category
export async function createCategory(data: CreateCategoryData): Promise<ApiResponse<any>> {
	try {
		const response = await fetchWithNgrok(`/store-config/categories`, {
			method: 'POST',
			headers: createAuthHeaders(),
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to create category')
		}

		return await response.json()
	} catch (error) {
		console.error('Error creating category:', error)
		throw error
	}
}

// Function to update a category
export async function updateCategory(data: UpdateCategoryData): Promise<ApiResponse<any>> {
	try {
		const response = await fetchWithNgrok(`/store-config/categories`, {
			method: 'PATCH',
			headers: createAuthHeaders(),
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to update category')
		}

		return await response.json()
	} catch (error) {
		console.error('Error updating category:', error)
		throw error
	}
}

// Function to delete a category
export async function deleteCategory(data: DeleteCategoryData): Promise<ApiResponse<null>> {
	try {
		const response = await fetchWithNgrok(`/store-config/categories`, {
			method: 'DELETE',
			headers: createAuthHeaders(),
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to delete category')
		}

		return await response.json()
	} catch (error) {
		console.error('Error deleting category:', error)
		throw error
	}
}

// Function to create a new subcategory
export async function createSubcategory(data: CreateSubcategoryData): Promise<ApiResponse<any>> {
	try {
		const response = await fetchWithNgrok(`/store-config/subcategories`, {
			method: 'POST',
			headers: createAuthHeaders(),
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to create subcategory')
		}

		return await response.json()
	} catch (error) {
		console.error('Error creating subcategory:', error)
		throw error
	}
}

// Function to update a subcategory
export async function updateSubcategory(data: UpdateSubcategoryData): Promise<ApiResponse<any>> {
	try {
		const response = await fetchWithNgrok(`/store-config/subcategories`, {
			method: 'PATCH',
			headers: createAuthHeaders(),
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to update subcategory')
		}

		return await response.json()
	} catch (error) {
		console.error('Error updating subcategory:', error)
		throw error
	}
}

// Function to delete a subcategory
export async function deleteSubcategory(data: DeleteSubcategoryData): Promise<ApiResponse<null>> {
	try {
		const response = await fetchWithNgrok(`/store-config/subcategories`, {
			method: 'DELETE',
			headers: createAuthHeaders(),
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to delete subcategory')
		}

		return await response.json()
	} catch (error) {
		console.error('Error deleting subcategory:', error)
		throw error
	}
}
