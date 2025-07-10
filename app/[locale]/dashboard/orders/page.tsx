'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'next-intl'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'

// Types & Interfaces
interface Order {
	id: number
	buyerId: number
	total: number
	shippingAddressId: number
	status: string
	paymentStatus: string
	stripeCheckoutSessionId: string
	shippingCarrier: string | null
	shippingCost: number
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

interface GetOrdersParams {
	page?: number
	limit?: number
}

// Queries & Mutations
const useGetOrders = (params: GetOrdersParams) =>
	useQuery({
		queryKey: ['orders', params],
		queryFn: async () => {
			try {
				const { page = 1, limit = 25 } = params
				const queryParams = new URLSearchParams({
					page: page.toString(),
					limit: limit.toString(),
				})

				const response = await fetchWithNgrok(`/orders?${queryParams}`, {
					method: 'GET',
				})

				if (!response.ok) {
					throw new Error(`Failed to fetch orders: ${response.status}`)
				}

				const data = await response.json()
				return data as OrdersResponse
			} catch (error) {
				console.error('Error fetching orders:', error)
				throw error
			}
		},
	})

// Util Functions
const formatCurrency = (amount: number | undefined) => {
	if (amount === undefined || amount === null) return 'N/A'
	return `$${(amount / 100).toFixed(2)}`
}

const formatDate = (dateString: string | undefined) => {
	if (!dateString) return 'N/A'
	return new Date(dateString).toLocaleDateString()
}

const getStatusBadgeVariant = (status: string) => {
	switch (status?.toLowerCase()) {
		case 'placed':
			return 'default'
		case 'processing':
			return 'secondary'
		case 'shipped':
			return 'outline'
		case 'delivered':
			return 'default'
		case 'cancelled':
			return 'destructive'
		default:
			return 'secondary'
	}
}

const getPaymentStatusBadgeVariant = (status: string) => {
	switch (status?.toLowerCase()) {
		case 'paid':
			return 'default'
		case 'pending':
			return 'secondary'
		case 'failed':
			return 'destructive'
		case 'refunded':
			return 'outline'
		default:
			return 'secondary'
	}
}

// Order Components
export function OrdersTable() {
	const t = useTranslations()
	const [currentPage, setCurrentPage] = useState(1)
	const limit = 25

	const { data, isLoading, isError, error } = useGetOrders({ page: currentPage, limit })

	if (isLoading) {
		return (
			<div className='flex justify-center py-8'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		)
	}

	if (isError) {
		return (
			<Alert variant='destructive' className='my-4'>
				<AlertDescription>
					{error instanceof Error ? error.message : 'Failed to load orders'}
				</AlertDescription>
			</Alert>
		)
	}

	const orders = data?.data?.orders || []
	const pagination = data?.data?.pagination

	return (
		<div className='space-y-4'>
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('orders.table.orderId') || 'Order ID'}</TableHead>
							<TableHead>{t('orders.table.buyerId') || 'Buyer ID'}</TableHead>
							<TableHead>{t('orders.table.total') || 'Total'}</TableHead>
							<TableHead>{t('orders.table.status') || 'Status'}</TableHead>
							<TableHead>{t('orders.table.paymentStatus') || 'Payment'}</TableHead>
							<TableHead>{t('orders.table.shippingCost') || 'Shipping'}</TableHead>
							<TableHead>{t('orders.table.createdAt') || 'Created'}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orders.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={8}
									className='py-8 text-center text-muted-foreground'>
									{t('orders.noOrders') || 'No orders found'}
								</TableCell>
							</TableRow>
						) : (
							orders.map((order: Order) => (
								<TableRow key={order.id}>
									<TableCell>
										<div>
											<p className='font-medium'>#{order.id}</p>
											<p className='text-xs text-muted-foreground'>
												{order.stripeCheckoutSessionId?.substring(0, 20)}...
											</p>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant='outline'>{order.buyerId}</Badge>
									</TableCell>
									<TableCell>
										<p className='font-medium'>{formatCurrency(order.total)}</p>
									</TableCell>
									<TableCell>
										<Badge variant={getStatusBadgeVariant(order.status)}>
											{order.status || 'Unknown'}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge
											variant={getPaymentStatusBadgeVariant(
												order.paymentStatus,
											)}>
											{order.paymentStatus || 'Unknown'}
										</Badge>
									</TableCell>
									<TableCell>{formatCurrency(order.shippingCost)}</TableCell>
									<TableCell>
										<div>
											<p className='text-sm'>{formatDate(order.createdAt)}</p>
											<p className='text-xs text-muted-foreground'>
												{formatDate(order.updatedAt)}
											</p>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{pagination && (
				<div className='flex items-center justify-between'>
					<p className='text-sm text-muted-foreground'>
						{t('pagination.showing') || 'Showing'} {orders.length}{' '}
						{t('pagination.of') || 'of'} {pagination.total}{' '}
						{t('orders.itemNames') || 'orders'}
					</p>
					<p className='text-sm text-muted-foreground'>
						{t('pagination.page') || 'Page'} {pagination.page}{' '}
						{t('pagination.of') || 'of'}{' '}
						{Math.ceil(pagination.total / pagination.limit)}
					</p>
				</div>
			)}
		</div>
	)
}

export default function OrdersPage() {
	const t = useTranslations()
	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-3xl font-bold tracking-tight'>
					{t('orders.title') || 'Orders'}
				</h2>
				<p className='text-muted-foreground'>
					{t('orders.description') || 'Manage customer orders and track their status.'}
				</p>
			</div>

			<OrdersTable />
		</div>
	)
}
