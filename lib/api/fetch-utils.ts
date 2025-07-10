import { getAuthToken } from './auth'
import { API_BASE_URL } from './config'

// Utility function to create a fetch request with the ngrok header
export async function fetchWithNgrok(url: string, options: RequestInit = {}) {
	// Ensure headers object exists
	const headers = options.headers || {}

	const authHeaders = createAuthHeaders()

	// Add the ngrok header
	const updatedHeaders: Record<any, any> = {
		...authHeaders,
		...headers,
	}

	if (updatedHeaders['Content-Type'] === 'remove') {
		delete updatedHeaders['Content-Type']
	}

	// Return the fetch promise with updated headers
	return fetch(API_BASE_URL + url, {
		...options,
		headers: updatedHeaders,
	})
}

// Create headers with authorization token if available
export function createAuthHeaders(): HeadersInit {
	const headers: HeadersInit = {
		'ngrok-skip-browser-warning': 'true',
		'bypass-tunnel-reminder': 'true',
		'Content-Type': 'application/json',
	}

	const token = getAuthToken()
	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}

	return headers
}
