'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'
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
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Types & Interfaces
interface User {
	firstName: string
	lastName: string
	email: string
}

interface Subscription {
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
	user: User
}

interface SubscriptionsResponse {
	statusCode: number
	status: string
	message: string
	data: {
		subscriptions: Subscription[]
		pagination: {
			total: number
			page: number
			limit: number
		}
	}
}

const fetchSubscriptions = async (page: number, limit: number): Promise<SubscriptionsResponse> => {
	const response = await fetchWithNgrok(`/users/subscriptions?page=${page}&limit=${limit}`, {
		method: 'GET',
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch subscriptions: ${response.status}`)
	}

	return response.json()
}

const formatDate = (dateString: string) => {
	try {
		return new Date(dateString).toLocaleDateString()
	} catch {
		return dateString
	}
}

export function SubscriptionsTable() {
	const t = useTranslations()
	const [page, setPage] = useState(1)
	const [limit] = useState(10)

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['subscriptions', page, limit],
		queryFn: () => fetchSubscriptions(page, limit),
	})

	const subscriptions = data?.data.subscriptions || []
	const pagination = data?.data.pagination || { page: 1, limit, total: 0 }
	const totalPages = Math.ceil(pagination.total / pagination.limit)

	const handlePreviousPage = () => {
		setPage((prev) => Math.max(prev - 1, 1))
	}

	const handleNextPage = () => {
		if (page < totalPages) {
			setPage((prev) => prev + 1)
		}
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
					{error instanceof Error ? error.message : t('subscriptions.errorLoading')}
				</AlertDescription>
			</Alert>
		)
	}

	return (
		<div className='space-y-4'>
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('subscriptions.id')}</TableHead>
							<TableHead>{t('subscriptions.userId')}</TableHead>
							<TableHead>{t('subscriptions.plan')}</TableHead>
							<TableHead>{t('subscriptions.status')}</TableHead>
							<TableHead>{t('subscriptions.payment')}</TableHead>
							<TableHead>{t('subscriptions.listings')}</TableHead>
							<TableHead>{t('subscriptions.nextRenewal')}</TableHead>
							<TableHead>{t('subscriptions.created')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{subscriptions.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={8}
									className='py-8 text-center text-muted-foreground'>
									{t('subscriptions.noSubscriptions')}
								</TableCell>
							</TableRow>
						) : (
							subscriptions.map((subscription) => (
								<TableRow key={subscription.id}>
									<TableCell className='font-medium'>{subscription.id}</TableCell>
									<TableCell>{subscription.userId}</TableCell>
									<TableCell>
										<Badge variant='outline'>{subscription.planId}</Badge>
									</TableCell>
									<TableCell>{subscription.status}</TableCell>
									<TableCell>{subscription.paymentStatus}</TableCell>
									<TableCell>
										{subscription.listingsRemaining > 999999
											? t('subscriptions.unlimited')
											: subscription.listingsRemaining.toLocaleString()}
									</TableCell>
									<TableCell>{formatDate(subscription.nextRenewal)}</TableCell>
									<TableCell>{formatDate(subscription.createdAt)}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{subscriptions.length > 0 && (
				<div className='flex items-center justify-between'>
					<div className='text-sm text-muted-foreground'>
						{t('pagination.showing')} {String((page - 1) * limit + 1)}-
						{String(Math.min(page * limit, pagination.total))} {t('pagination.of')}{' '}
						{pagination.total} {t('subscriptions.itemsName')}
					</div>
					<div className='flex items-center space-x-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={handlePreviousPage}
							disabled={page <= 1}>
							<ChevronLeft className='mr-1 h-4 w-4' /> {t('pagination.prev')}
						</Button>
						<div className='text-sm'>
							{t('pagination.page')} {page} {t('pagination.of')} {totalPages}
						</div>
						<Button
							variant='outline'
							size='sm'
							onClick={handleNextPage}
							disabled={page >= totalPages}>
							{t('pagination.next')} <ChevronRight className='ml-1 h-4 w-4' />
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
