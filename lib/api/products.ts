import { fetchWithNgrok } from './fetch-utils'

// Define the API response type
type ApiResponse<T> = {
	statusCode: number
	status: string
	message: string
	data: T
}

// Product image type
type ProductImage = {
	id: number
	url: string
}

// Seller type
type Seller = {
	id: number
	firstName: string
	lastName: string
	username: string
	email: string
	avatarUrl: string
	isInfluencer: boolean
}

// Product type
export type Product = {
	id: number
	sellerId: number
	title: string
	description: string | null
	category: string
	subcategory: string
	brand: string
	brandImage: string
	size: string
	color: string | null
	colorCode: string | null
	material: string | null
	condition: string
	price: number
	isAuction: boolean
	isFeatured: boolean
	isPremium: boolean
	startDate: string | null
	endDate: string | null
	productHeight: number | null
	chestMeasurement: number | null
	waistMeasurement: number | null
	hipsMeasurement: number | null
	status: string
	createdAt: string
	updatedAt: string
	images: ProductImage[]
	seller: Seller
	bids: any[]
}

// Pagination type
type Pagination = {
	page: number
	limit: number
	total: number
}

// Products list response type
type ProductsListResponse = {
	products: Product[]
	pagination: Pagination
}

// Product update data type - now accepts FormData
type ProductUpdateData =
	| FormData
	| {
			isPremium?: boolean
			isFeatured?: boolean
			status?: 'pending_approval' | 'draft' | 'live' | 'auction_ended' | 'sold' | 'archived'
			sellerId?: number
	  }

// Function to get all products with pagination
export async function getAllProducts(
	page = 1,
	limit = 25,
): Promise<ApiResponse<ProductsListResponse>> {
	try {
		const response = await fetchWithNgrok(`/products?page=${page}&limit=${limit}&sort=desc`)

		if (!response.ok) {
			throw new Error(`Failed to fetch products: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Error fetching products:', error)
		throw error
	}
}

// Function to update a product
export async function updateProduct(
	productId: number,
	data: ProductUpdateData,
): Promise<ApiResponse<Product>> {
	try {
		const isFormData = data instanceof FormData

		// For FormData, create headers without Content-Type
		const headers = isFormData ? { 'Content-Type': 'remove' } : undefined

		const response = await fetchWithNgrok(`/products/${productId}`, {
			method: 'PATCH',
			headers,
			body: isFormData ? data : JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to update product')
		}

		return await response.json()
	} catch (error) {
		console.error('Error updating product:', error)
		throw error
	}
}

// Function to create a new product
export async function createProduct(data: FormData): Promise<ApiResponse<Product>> {
	try {
		const response = await fetchWithNgrok(`/products`, {
			method: 'POST',
			headers: { 'Content-Type': 'remove' },
			body: data,
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to create product')
		}

		return await response.json()
	} catch (error) {
		console.error('Error creating product:', error)
		throw error
	}
}

// Function to update a product
export async function updateProductFull(
	productId: number,
	data: FormData,
): Promise<ApiResponse<Product>> {
	try {
		const response = await fetchWithNgrok(`/products/${productId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'remove' },
			body: data,
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to update product')
		}

		return await response.json()
	} catch (error) {
		console.error('Error updating product:', error)
		throw error
	}
}

// Function to get a single product by ID
export async function getProductById(productId: number): Promise<ApiResponse<Product>> {
	try {
		const response = await fetchWithNgrok(`/products/${productId}`)

		if (!response.ok) {
			throw new Error(`Failed to fetch product: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Error fetching product:', error)
		throw error
	}
}

export async function deleteProduct(productId: number): Promise<ApiResponse<{}>> {
	try {
		const response = await fetchWithNgrok(`/products/${productId}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to delete product')
		}

		return await response.json()
	} catch (error) {
		console.error('Error deleting product:', error)
		throw error
	}
}
