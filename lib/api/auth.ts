import { fetchWithNgrok } from './fetch-utils'

// Define the API response type
type ApiResponse<T> = {
	statusCode: number
	status: string
	message: string
	data: T
}

// Renamed User type to Admin
export type Admin = {
	id: number
	name: string
	email: string
	createdAt: string
}

// Pagination type
type Pagination = {
	page: number
	limit: number
	total: number
}

// Admin list response type
type AdminsListResponse = {
	admins: Admin[]
	pagination: Pagination
}

// Function to get the auth token from localStorage
export function getAuthToken(): string | null {
	if (typeof window === 'undefined') return null
	return localStorage.getItem('auth_token')
}

// Function to set the auth token in localStorage
function setAuthToken(token: string): void {
	if (typeof window === 'undefined') return
	localStorage.setItem('auth_token', token)
}

// Function to remove the auth token from localStorage
function removeAuthToken(): void {
	if (typeof window === 'undefined') return
	localStorage.removeItem('auth_token')
}

export async function loginUser(data: any) {
	try {
		const loginUrl = `/admins/login`

		// Use the updated endpoint: /admins/login
		const response = await fetchWithNgrok(loginUrl, {
			method: 'POST',
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Login failed')
		}

		const responseData = await response.json()

		// Store the token from the response
		if (responseData.data && responseData.data.token) {
			setAuthToken(responseData.data.token)
		}

		return responseData
	} catch (error) {
		console.error('Login error details:', error)

		// Provide more specific error messages based on the error type
		if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
			throw new Error(
				'Cannot connect to the server. Please check your internet connection or try again later.',
			)
		}

		throw error
	}
}

// Add a function to check authentication status
export async function checkAuthStatus(): Promise<ApiResponse<Admin>> {
	try {
		const response = await fetchWithNgrok(`/admins/me`)

		if (!response.ok) {
			throw new Error('Not authenticated')
		}

		return await response.json()
	} catch (error) {
		throw error
	}
}

// Add a function to get all admins with pagination
export async function getAllAdmins(page = 1, limit = 25): Promise<ApiResponse<AdminsListResponse>> {
	try {
		const response = await fetchWithNgrok(`/admins?page=${page}&limit=${limit}`)

		if (!response.ok) {
			throw new Error(`Failed to fetch admins: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Error fetching admins:', error)
		throw error
	}
}

// Add a function to create a new admin
export async function createAdmin(data: any): Promise<ApiResponse<Admin>> {
	try {
		const response = await fetchWithNgrok(`/admins`, {
			method: 'POST',
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to create admin')
		}

		return await response.json()
	} catch (error) {
		console.error('Error creating admin:', error)
		throw error
	}
}

// Add a function to delete an admin
export async function deleteAdmin(id: number): Promise<ApiResponse<null>> {
	try {
		const response = await fetchWithNgrok(`/admins/${id}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to delete admin')
		}

		return await response.json()
	} catch (error) {
		console.error('Error deleting admin:', error)
		throw error
	}
}

// Add a logout function
export async function logoutUser() {
	removeAuthToken()
}

// Function to decode JWT token and get user info
function decodeToken(token: string): any {
	try {
		// JWT tokens are base64 encoded in 3 parts: header.payload.signature
		const base64Url = token.split('.')[1]
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join(''),
		)
		return JSON.parse(jsonPayload)
	} catch (error) {
		console.error('Error decoding token:', error)
		return null
	}
}

// Function to check if token is expired
export function isTokenExpired(token: string): boolean {
	try {
		const decoded = decodeToken(token)
		if (!decoded || !decoded.exp) return true

		// exp is in seconds, Date.now() is in milliseconds
		return decoded.exp * 1000 < Date.now()
	} catch (error) {
		return true
	}
}
