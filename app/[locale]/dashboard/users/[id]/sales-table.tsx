'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Loader2, Filter, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Types & Interfaces
interface Transaction {
	id: number
	for: string
	type: string
	userId: number
	balanceId: number
	orderId: number
	productId: number
	subscriptionId: number | null
	accountId: number | null
	amount: number
	status:
		| 'pending'
		| 'processing'
		| 'pending-clearance'
		| 'succeeded'
		| 'failed'
		| 'payment-failed'
		| 'cancelled'
		| 'refunded'
		| 'rejected'
	balanceRecalculated: boolean
	createdAt: string
	updatedAt: string
}

interface TransactionsResponse {
	statusCode: number
	status: string
	message: string
	data: {
		transactions: Transaction[]
		pagination: {
			total: number
			page: number
			limit: number
			nextPage: boolean
			prevPage: boolean
		}
	}
}

// Query hook
const useUserSales = (userId: string, page: number = 1, limit: number = 25, status?: string) => {
	return useQuery<TransactionsResponse>({
		queryKey: ['user-sales', userId, page, limit, status],
		queryFn: async () => {
			const params = new URLSearchParams({
				userId: userId,
				type: 'order',
				page: page.toString(),
				limit: limit.toString(),
			})

			if (status && status !== 'all') {
				params.append('status', status)
			}

			const response = await fetchWithNgrok(`/revenue/transactions?${params.toString()}`, {
				method: 'GET',
			})

			if (!response.ok) {
				throw new Error(`Failed to fetch user sales: ${response.status}`)
			}

			return response.json()
		},
		enabled: !isNaN(parseInt(userId, 10)),
	})
}

// Utility functions
const formatCurrency = (amount: number) => {
	return `$${amount.toFixed(2)}`
}

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString()
}

const getStatusBadgeVariant = (status: Transaction['status']) => {
	switch (status) {
		case 'succeeded':
			return 'default'
		case 'pending':
		case 'processing':
		case 'pending-clearance':
			return 'secondary'
		case 'failed':
		case 'payment-failed':
		case 'rejected':
			return 'destructive'
		case 'cancelled':
		case 'refunded':
			return 'outline'
		default:
			return 'secondary'
	}
}

export default function UsersSalesTable({ userId }: { userId: string }) {
	const t = useTranslations()
	const [currentPage, setCurrentPage] = useState(1)
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const limit = 25

	const { data, isLoading, isError, error } = useUserSales(
		userId,
		currentPage,
		limit,
		statusFilter,
	)

	const handleClearFilters = () => {
		setStatusFilter('all')
		setCurrentPage(1)
	}

	const handleStatusChange = (value: string) => {
		setStatusFilter(value)
		setCurrentPage(1) // Reset to first page when filter changes
	}

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
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
					{error instanceof Error ? error.message : t('sales.loadError')}
				</AlertDescription>
			</Alert>
		)
	}

	const transactions = data?.data?.transactions || []
	const pagination = data?.data?.pagination
	const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1

	return (
		<div className='space-y-4'>
			{/* Filters */}
			<div className='flex items-center gap-4'>
				<div className='flex items-center gap-2'>
					<Filter className='h-4 w-4 text-muted-foreground' />
					<span className='text-sm font-medium'>{t('sales.filters.title')}</span>
				</div>
				<Select value={statusFilter} onValueChange={handleStatusChange}>
					<SelectTrigger className='w-48'>
						<SelectValue placeholder={t('sales.filters.status.placeholder')} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>{t('sales.filters.status.all')}</SelectItem>
						<SelectItem value='pending'>{t('sales.status.pending')}</SelectItem>
						<SelectItem value='processing'>{t('sales.status.processing')}</SelectItem>
						<SelectItem value='pending-clearance'>
							{t('sales.status.pendingClearance')}
						</SelectItem>
						<SelectItem value='succeeded'>{t('sales.status.succeeded')}</SelectItem>
						<SelectItem value='failed'>{t('sales.status.failed')}</SelectItem>
						<SelectItem value='payment-failed'>
							{t('sales.status.paymentFailed')}
						</SelectItem>
						<SelectItem value='cancelled'>{t('sales.status.cancelled')}</SelectItem>
						<SelectItem value='refunded'>{t('sales.status.refunded')}</SelectItem>
						<SelectItem value='rejected'>{t('sales.status.rejected')}</SelectItem>
					</SelectContent>
				</Select>
				{statusFilter !== 'all' && (
					<Button
						variant='ghost'
						size='sm'
						onClick={handleClearFilters}
						className='gap-2'>
						<X className='h-4 w-4' />
						{t('common.clear')}
					</Button>
				)}
			</div>

			{/* Table */}
			{transactions.length > 0 ? (
				<>
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('sales.table.id')}</TableHead>
									<TableHead>{t('sales.table.orderId')}</TableHead>
									<TableHead>{t('sales.table.productId')}</TableHead>
									<TableHead>{t('sales.table.amount')}</TableHead>
									<TableHead>{t('sales.table.status')}</TableHead>
									<TableHead>{t('sales.table.created')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{transactions.map((transaction) => (
									<TableRow key={transaction.id}>
										<TableCell>
											<span className='font-medium'>#{transaction.id}</span>
										</TableCell>
										<TableCell>
											<span className='font-medium'>
												#{transaction.orderId}
											</span>
										</TableCell>
										<TableCell>
											<span className='font-medium'>
												#{transaction.productId}
											</span>
										</TableCell>
										<TableCell>
											<span className='font-medium text-green-600'>
												{formatCurrency(transaction.amount)}
											</span>
										</TableCell>
										<TableCell>
											<Badge
												variant={getStatusBadgeVariant(transaction.status)}>
												{t(
													`sales.status.${transaction.status.replace('-', '')}` as any,
												)}
											</Badge>
										</TableCell>
										<TableCell>
											<span className='text-sm'>
												{formatDate(transaction.createdAt)}
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Pagination Controls */}
					{pagination && (
						<div className='mt-2 flex items-center justify-between'>
							<Button
								variant='outline'
								size='sm'
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage <= 1 || !pagination.prevPage}>
								{t('pagination.prev')}
							</Button>
							<span className='text-sm text-muted-foreground'>
								{t('pagination.page')} {pagination.page} {t('pagination.of')}{' '}
								{totalPages}
							</span>
							<Button
								variant='outline'
								size='sm'
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage >= totalPages || !pagination.nextPage}>
								{t('pagination.next')}
							</Button>
						</div>
					)}

					{/* Pagination Summary */}
					{pagination && (
						<div className='flex items-center justify-between text-sm text-muted-foreground'>
							<p>
								{t('pagination.showing')} {transactions.length} {t('pagination.of')}{' '}
								{pagination.total} {t('sales.itemNames')}
							</p>
						</div>
					)}
				</>
			) : (
				<div className='py-8 text-center text-muted-foreground'>{t('sales.noSales')}</div>
			)}
		</div>
	)
}
