import { fetchWithNgrok, createAuthHeaders } from "./fetch-utils"
import { API_BASE_URL } from "./config"

export interface Order {
  id: number
  buyerId: number
  total: number
  shippingAddressId: number
  status: string
  paymentStatus: string
  stripeCheckoutSessionId: string
  shippingCarrier: string | null
  shippingServiceLevel: string | null
  shippingCost: number
  platformFee: number
  shipmentTrackingUrl: string | null
  createdAt: string
  updatedAt: string
}

interface OrdersResponse {
  statusCode: number
  status: string
  message: string
  data: {
    orders: Order[]
    pagination: {
      page: number
      limit: number
      total: number
    }
  }
}

interface OrdersParams {
  page?: number
  limit?: number
}

export async function getAllOrders(params: OrdersParams = {}): Promise<OrdersResponse> {
  try {
    const { page = 1, limit = 25 } = params
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    const response = await fetchWithNgrok(`${API_BASE_URL}/orders?${queryParams}`, {
      method: "GET",
      headers: createAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}
