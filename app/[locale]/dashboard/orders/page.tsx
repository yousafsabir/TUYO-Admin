'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Edit, ChevronLeft, ChevronRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'next-intl'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import React from 'react'

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
			prevPage: boolean
			nextPage: boolean
		}
	}
}

interface GetOrdersParams {
	page?: number
	limit?: number
}

// Zod schema for order updates
const updateOrderSchema = z
	.object({
		status: z.enum([
			'pending',
			'processing_payment',
			'placed',
			'processing',
			'shipped',
			'canceled',
			'on_hold',
			'completed',
		]),
		paymentStatus: z.enum(['processing', 'paid', 'failed', 'refunded', 'unpaid']),
		shippingCarrier: z.string(),
		shipmentTrackingUrl: z.string(),
	})
	.partial()

type UpdateOrderFormData = z.infer<typeof updateOrderSchema>

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

const useUpdateOrder = () => {
	const queryClient = useQueryClient()
	const { toast } = useToast()

	return useMutation({
		mutationFn: async ({ id, data }: { id: number; data: UpdateOrderFormData }) => {
			const response = await fetchWithNgrok(`/orders/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Failed to update order')
			}

			return response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['orders'] })
			toast({
				title: 'Success',
				description: 'Order updated successfully',
				variant: 'default',
			})
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			})
		},
	})
}

// Util Functions
const formatCurrency = (amount: number | undefined) => {
	if (amount === undefined || amount === null) return 'N/A'
	return `$${amount.toFixed(2)}`
}

const formatDate = (dateString: string | undefined) => {
	if (!dateString) return 'N/A'
	return new Date(dateString).toLocaleDateString()
}

const getStatusBadgeVariant = (status: string) => {
	switch (status?.toLowerCase()) {
		case 'placed':
		case 'completed':
			return 'default'
		case 'processing':
		case 'processing_payment':
			return 'secondary'
		case 'shipped':
			return 'outline'
		case 'pending':
		case 'on_hold':
			return 'secondary'
		case 'canceled':
			return 'destructive'
		default:
			return 'secondary'
	}
}

const getPaymentStatusBadgeVariant = (status: string) => {
	switch (status?.toLowerCase()) {
		case 'paid':
			return 'default'
		case 'processing':
		case 'unpaid':
			return 'secondary'
		case 'failed':
			return 'destructive'
		case 'refunded':
			return 'outline'
		default:
			return 'secondary'
	}
}

// Add these translation helper functions (same as your existing ones)
const getTranslatedOrderStatus = (status: string, t: any) => {
	switch (status?.toLowerCase()) {
		case 'pending':
			return t('orders.status.pending')
		case 'processing_payment':
			return t('orders.status.processingPayment')
		case 'placed':
			return t('orders.status.placed')
		case 'processing':
			return t('orders.status.processing')
		case 'shipped':
			return t('orders.status.shipped')
		case 'canceled':
			return t('orders.status.canceled')
		case 'on_hold':
			return t('orders.status.onHold')
		case 'completed':
			return t('orders.status.completed')
		default:
			return status || t('orders.status.unknown')
	}
}

const getTranslatedPaymentStatus = (status: string, t: any) => {
	switch (status?.toLowerCase()) {
		case 'processing':
			return t('orders.paymentStatus.processing')
		case 'paid':
			return t('orders.paymentStatus.paid')
		case 'failed':
			return t('orders.paymentStatus.failed')
		case 'refunded':
			return t('orders.paymentStatus.refunded')
		case 'unpaid':
			return t('orders.paymentStatus.unpaid')
		default:
			return status || t('orders.paymentStatus.unknown')
	}
}

// Order Components

function UpdateOrderModal({
	order,
	open,
	onOpenChange,
}: {
	order: Order
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const t = useTranslations()
	const updateOrderMutation = useUpdateOrder()

	const form = useForm<UpdateOrderFormData>({
		resolver: zodResolver(updateOrderSchema),
		defaultValues: {
			status: order.status as any,
			paymentStatus: order.paymentStatus as any,
			shippingCarrier: order.shippingCarrier || '',
			shipmentTrackingUrl: order.shipmentTrackingUrl || '',
		},
	})

	// Reset form when order changes
	React.useEffect(() => {
		form.reset({
			status: order.status as any,
			paymentStatus: order.paymentStatus as any,
			shippingCarrier: order.shippingCarrier || '',
			shipmentTrackingUrl: order.shipmentTrackingUrl || '',
		})
	}, [order, form])

	const onSubmit = async (data: UpdateOrderFormData) => {
		try {
			// Remove empty strings and convert to undefined
			const cleanedData = Object.fromEntries(
				Object.entries(data).filter(([_, value]) => value !== ''),
			) as UpdateOrderFormData

			await updateOrderMutation.mutateAsync({ id: order.id, data: cleanedData })
			onOpenChange(false)
		} catch (error) {
			// Error is handled by the mutation
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>{t('orders.updateOrder')}</DialogTitle>
					<DialogDescription>
						{t('orders.updateOrderDescription')} #{order.id}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
					<div className='space-y-4'>
						{/* Order Status */}
						<div className='space-y-2'>
							<Label htmlFor='order-status'>{t('orders.form.status.label')}</Label>
							<Select
								value={form.watch('status')}
								onValueChange={(value) => form.setValue('status', value as any)}>
								<SelectTrigger id='order-status'>
									<SelectValue
										placeholder={t('orders.form.status.placeholder')}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='pending'>
										{t('orders.status.pending')}
									</SelectItem>
									<SelectItem value='processing_payment'>
										{t('orders.status.processingPayment')}
									</SelectItem>
									<SelectItem value='placed'>
										{t('orders.status.placed')}
									</SelectItem>
									<SelectItem value='processing'>
										{t('orders.status.processing')}
									</SelectItem>
									<SelectItem value='shipped'>
										{t('orders.status.shipped')}
									</SelectItem>
									<SelectItem value='canceled'>
										{t('orders.status.canceled')}
									</SelectItem>
									<SelectItem value='on_hold'>
										{t('orders.status.onHold')}
									</SelectItem>
									<SelectItem value='completed'>
										{t('orders.status.completed')}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Payment Status */}
						<div className='space-y-2'>
							<Label htmlFor='payment-status'>
								{t('orders.form.paymentStatus.label')}
							</Label>
							<Select
								value={form.watch('paymentStatus')}
								onValueChange={(value) =>
									form.setValue('paymentStatus', value as any)
								}>
								<SelectTrigger id='payment-status'>
									<SelectValue
										placeholder={t('orders.form.paymentStatus.placeholder')}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='processing'>
										{t('orders.paymentStatus.processing')}
									</SelectItem>
									<SelectItem value='paid'>
										{t('orders.paymentStatus.paid')}
									</SelectItem>
									<SelectItem value='failed'>
										{t('orders.paymentStatus.failed')}
									</SelectItem>
									<SelectItem value='refunded'>
										{t('orders.paymentStatus.refunded')}
									</SelectItem>
									<SelectItem value='unpaid'>
										{t('orders.paymentStatus.unpaid')}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Shipping Carrier */}
						<div className='space-y-2'>
							<Label htmlFor='shipping-carrier'>
								{t('orders.form.shippingCarrier.label')}
							</Label>
							<Input
								id='shipping-carrier'
								placeholder={t('orders.form.shippingCarrier.placeholder')}
								{...form.register('shippingCarrier')}
							/>
						</div>

						{/* Shipment Tracking URL */}
						<div className='space-y-2'>
							<Label htmlFor='tracking-url'>
								{t('orders.form.trackingUrl.label')}
							</Label>
							<Input
								id='tracking-url'
								type='url'
								placeholder={t('orders.form.trackingUrl.placeholder')}
								{...form.register('shipmentTrackingUrl')}
							/>
						</div>
					</div>

					<div className='flex justify-end gap-2'>
						<Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
							{t('common.cancel')}
						</Button>
						<Button type='submit' disabled={updateOrderMutation.isPending}>
							{updateOrderMutation.isPending
								? t('common.updating')
								: t('common.update')}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export function OrdersTable() {
	const t = useTranslations()
	const [currentPage, setCurrentPage] = useState(1)
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
	const [updateModalOpen, setUpdateModalOpen] = useState(false)
	const limit = 25

	const { data, isLoading, isError, error } = useGetOrders({ page: currentPage, limit })

	const handleEditOrder = (order: Order) => {
		setSelectedOrder(order)
		setUpdateModalOpen(true)
	}

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
					{error instanceof Error ? error.message : t('orders.loading-error')}
				</AlertDescription>
			</Alert>
		)
	}

	const orders = data?.data?.orders || []
	const pagination = data?.data?.pagination || { total: 0, page: 1, limit }

	const totalPages = Math.ceil(pagination.total / pagination.limit)

	const handlePreviousPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1))
	}

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage((prev) => prev + 1)
		}
	}

	return (
		<>
			<div className='space-y-4'>
				<div className='rounded-md border'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('orders.table.orderId')}</TableHead>
								<TableHead>{t('orders.table.buyerId')}</TableHead>
								<TableHead>{t('orders.table.total')}</TableHead>
								<TableHead>{t('orders.table.status')}</TableHead>
								<TableHead>{t('orders.table.paymentStatus')}</TableHead>
								<TableHead>{t('orders.table.shippingCost')}</TableHead>
								<TableHead>{t('orders.table.createdAt')}</TableHead>
								<TableHead>{t('common.actions')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orders.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={8}
										className='py-8 text-center text-muted-foreground'>
										{t('orders.noOrders')}
									</TableCell>
								</TableRow>
							) : (
								orders.map((order: Order) => (
									<TableRow key={order.id}>
										<TableCell>
											<div>
												<p className='font-medium'>#{order.id}</p>
												<p className='text-xs text-muted-foreground'>
													{order.stripeCheckoutSessionId?.substring(
														0,
														20,
													)}
													...
												</p>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant='outline'>{order.buyerId}</Badge>
										</TableCell>
										<TableCell>
											<p className='font-medium'>
												{formatCurrency(order.total)}
											</p>
										</TableCell>
										<TableCell>
											<Badge variant={getStatusBadgeVariant(order.status)}>
												{getTranslatedOrderStatus(order.status, t)}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge
												variant={getPaymentStatusBadgeVariant(
													order.paymentStatus,
												)}>
												{getTranslatedPaymentStatus(order.paymentStatus, t)}
											</Badge>
										</TableCell>
										<TableCell>{formatCurrency(order.shippingCost)}</TableCell>
										<TableCell>
											<div>
												<p className='text-sm'>
													{formatDate(order.createdAt)}
												</p>
												<p className='text-xs text-muted-foreground'>
													{formatDate(order.updatedAt)}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleEditOrder(order)}
												className='gap-2'>
												<Edit className='h-4 w-4' />
												{t('common.edit')}
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination controls */}
				{orders.length > 0 && (
					<div className='flex items-center justify-between'>
						<div className='text-sm text-muted-foreground'>
							{t('pagination.showing')} {String((currentPage - 1) * limit + 1)}-
							{String(Math.min(currentPage * limit, pagination.total))}{' '}
							{t('pagination.of')} {String(pagination.total)} {t('orders.itemNames')}
						</div>
						<div className='flex items-center space-x-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={handlePreviousPage}
								disabled={currentPage <= 1}>
								<ChevronLeft className='mr-1 h-4 w-4' />
								{t('pagination.prev')}
							</Button>
							<div className='text-sm'>
								{t('pagination.page')} {currentPage} {t('pagination.of')}{' '}
								{totalPages}
							</div>
							<Button
								variant='outline'
								size='sm'
								onClick={handleNextPage}
								disabled={currentPage >= totalPages}>
								{t('pagination.next')}
								<ChevronRight className='ml-1 h-4 w-4' />
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Update Order Modal */}
			{selectedOrder && (
				<UpdateOrderModal
					order={selectedOrder}
					open={updateModalOpen}
					onOpenChange={setUpdateModalOpen}
				/>
			)}
		</>
	)
}

export default function OrdersPage() {
	const t = useTranslations()
	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-3xl font-bold tracking-tight'>{t('orders.title')}</h2>
				<p className='text-muted-foreground'>{t('orders.description')}</p>
			</div>

			<OrdersTable />
		</div>
	)
}
