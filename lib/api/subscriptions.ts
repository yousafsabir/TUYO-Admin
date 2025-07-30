import { fetchWithNgrok } from './fetch-utils'

export interface Subscription {
	id: number
	userId: number
	planId: string
	status: string
	paymentStatus: string
	listingsRemaining: number
	auctionsAllowed: boolean
	featuredProductsAllowed: boolean
	premiumProductsAllowed: boolean
	renewedAt: string
	nextRenewal: string
	stripeSubscriptionId: string
	createdAt: string
	updatedAt: string
}

interface SubscriptionsResponse {
	statusCode: number
	status: string
	message: string
	data: {
		subscriptions: Subscription[]
		pagination: {
			page: number
			limit: number
			total: number
			prevPage: boolean
			nextPage: boolean
		}
	}
}

export async function getSubscriptions(page = 1, limit = 25): Promise<SubscriptionsResponse> {
	try {
		const response = await fetchWithNgrok(`/users/subscriptions?page=${page}&limit=${limit}`, {
			method: 'GET',
		})

		if (!response.ok) {
			throw new Error(`Failed to fetch subscriptions: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Error fetching subscriptions:', error)
		throw error
	}
}
