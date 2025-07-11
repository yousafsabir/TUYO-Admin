import { fetchWithNgrok } from './fetch-utils'

// Define the API response type
type ApiResponse<T> = {
	statusCode: number
	status: string
	message: string
	data: T
}

// Feature type for subscription plans
type PlanFeature = {
	heading: string
	para: string
}

// Subscription plan type
export type SubscriptionPlan = {
	id: number
	planId: string
	title: string
	subtitle: string | null
	price: number
	features: PlanFeature[]
	listingsLimit: number
	auctionsAllowed: boolean
	featuredProductsAllowed: boolean
	premiumProductsAllowed: boolean
	stripePriceId: string
	createdAt: string
	updatedAt: string
}

// Subscription plan update data type (only editable fields)
type UpdateSubscriptionPlanData = {
	id: number
	title: string
	price: number
	subtitle: string | null
	features: PlanFeature[]
	listingsLimit: number
	auctionsAllowed: boolean
	featuredProductsAllowed: boolean
	premiumProductsAllowed: boolean
	stripePriceId: string
}

// Function to get all subscription plans
export async function getAllSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
	try {
		const response = await fetchWithNgrok(`/store-config/subscription-plans`)

		if (!response.ok) {
			throw new Error(`Failed to fetch subscription plans: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Error fetching subscription plans:', error)
		throw error
	}
}

// Function to update a subscription plan
export async function updateSubscriptionPlan(
	data: UpdateSubscriptionPlanData,
): Promise<ApiResponse<SubscriptionPlan>> {
	try {
		const response = await fetchWithNgrok(`/store-config/subscription-plans`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: `HTTP error ${response.status}` }))
			throw new Error(errorData.message || 'Failed to update subscription plan')
		}

		return await response.json()
	} catch (error) {
		console.error('Error updating subscription plan:', error)
		throw error
	}
}
