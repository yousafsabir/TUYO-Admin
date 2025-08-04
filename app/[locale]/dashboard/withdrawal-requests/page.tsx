'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Loader2, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Types & Interfaces
interface Transaction {
	id: number
	for: string
	type: string
	userId: number
	balanceId: number
	orderId: number | null
	productId: number | null
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
const useUserWithdrawals = (
	page: number = 1,
	limit: number = 25,
	status?: string,
	userId?: string,
) => {
	return useQuery<TransactionsResponse>({
		queryKey: ['all-withdrawals', userId, page, limit, status],
		queryFn: async () => {
			const params = new URLSearchParams({
				type: 'withdrawal',
				page: page.toString(),
				limit: limit.toString(),
			})

			if (status && status !== 'all') {
				params.append('status', status)
			}

			if (userId) {
				params.append('userId', userId)
			}

			const response = await fetchWithNgrok(`/revenue/transactions?${params.toString()}`, {
				method: 'GET',
			})

			if (!response.ok) {
				throw new Error(`Failed to fetch withdrawal requests: ${response.status}`)
			}

			return response.json()
		},
	})
}

// Mutation hook to perform approve/reject actions
function useWithdrawAction() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, action }: { id: number; action: 'approve' | 'reject' }) => {
			const response = await fetchWithNgrok(`/revenue/withdrawal-action/${id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action }),
			})

			if (!response.ok) {
				const data = await response.json()
				throw new Error(data.message || 'Failed to perform withdrawal action')
			}

			return response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['all-withdrawals'] as any)
		},
	})
}

// Buttons component
export function WithdrawalActions({ id }: { id: number }) {
	const withdrawAction = useWithdrawAction()
	const t = useTranslations()
	return (
		<div className='flex space-x-2'>
			<Button
				variant='outline'
				size='sm'
				disabled={withdrawAction.isPending}
				onClick={() => withdrawAction.mutate({ id, action: 'approve' })}>
				{t('common.approve')}
			</Button>
			<Button
				variant='destructive'
				size='sm'
				disabled={withdrawAction.isPending}
				onClick={() => withdrawAction.mutate({ id, action: 'reject' })}>
				{t('common.reject')}
			</Button>
		</div>
	)
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

export default function WithdrawalRequests() {
	const t = useTranslations()
	const [currentPage, setCurrentPage] = useState(1)
	const [statusFilter, setStatusFilter] = useState<string>('pending')
	const [userId, setUserId] = useState<string | undefined>(undefined)
	const limit = 25

	const { data, isLoading, isError, error } = useUserWithdrawals(
		currentPage,
		limit,
		statusFilter,
		userId,
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
					{error instanceof Error ? error.message : t('withdrawals.loadError')}
				</AlertDescription>
			</Alert>
		)
	}

	const transactions = data?.data?.transactions || []
	const pagination = data?.data?.pagination
	const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-3xl font-bold tracking-tight'>
					{t('navigation.withdrawal-requests')}
				</h2>
			</div>
			{/* Filters */}
			<div className='flex items-center gap-4'>
				<div className='flex items-center gap-2'>
					<Filter className='h-4 w-4 text-muted-foreground' />
					<span className='text-sm font-medium'>{t('withdrawals.filters.title')}</span>
				</div>
				<Select value={statusFilter} onValueChange={handleStatusChange}>
					<SelectTrigger className='w-48'>
						<SelectValue placeholder={t('withdrawals.filters.status.placeholder')} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>{t('withdrawals.filters.status.all')}</SelectItem>
						<SelectItem value='pending'>{t('withdrawals.status.pending')}</SelectItem>
						<SelectItem value='processing'>
							{t('withdrawals.status.processing')}
						</SelectItem>
						<SelectItem value='pending-clearance'>
							{t('withdrawals.status.pendingClearance')}
						</SelectItem>
						<SelectItem value='succeeded'>
							{t('withdrawals.status.succeeded')}
						</SelectItem>
						<SelectItem value='failed'>{t('withdrawals.status.failed')}</SelectItem>
						<SelectItem value='payment-failed'>
							{t('withdrawals.status.paymentFailed')}
						</SelectItem>
						<SelectItem value='cancelled'>
							{t('withdrawals.status.cancelled')}
						</SelectItem>
						<SelectItem value='refunded'>{t('withdrawals.status.refunded')}</SelectItem>
						<SelectItem value='rejected'>{t('withdrawals.status.rejected')}</SelectItem>
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
									<TableHead>{t('sales.table.userId')}</TableHead>
									<TableHead>{t('sales.table.amount')}</TableHead>
									<TableHead>{t('sales.table.status')}</TableHead>
									<TableHead>{t('sales.table.created')}</TableHead>
									<TableHead>{t('sales.table.actions')}</TableHead>
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
												#{transaction.userId}
											</span>
										</TableCell>
										<TableCell>
											<span className='font-medium'>
												{formatCurrency(transaction.amount)}
											</span>
										</TableCell>
										<TableCell>
											<Badge
												variant={getStatusBadgeVariant(transaction.status)}>
												{t(
													`withdrawals.status.${transaction.status.replace('-', '')}` as any,
												)}
											</Badge>
										</TableCell>
										<TableCell>
											<span className='text-sm'>
												{formatDate(transaction.createdAt)}
											</span>
										</TableCell>
										<TableCell>
											<WithdrawalActions id={transaction.id} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{pagination && (
						<div className='flex items-center justify-between text-sm'>
							<p className='text-muted-foreground'>
								{t('pagination.showing')} {transactions.length} {t('pagination.of')}{' '}
								{pagination.total} {t('withdrawals.itemNames')}
							</p>

							<div className='flex items-center justify-between gap-3'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage <= 1 || !pagination.prevPage}>
									<ChevronLeft className='mr-1 size-4' />
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
									<ChevronRight className='ml-1 size-4' />
								</Button>
							</div>
						</div>
					)}
				</>
			) : (
				<div className='py-8 text-center text-muted-foreground'>
					{t('withdrawals.noWithdrawals')}
				</div>
			)}
		</div>
	)
}
