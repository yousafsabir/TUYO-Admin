'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

import { fetchWithNgrok } from '@/lib/api/fetch-utils'

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
			prev: boolean
			next: boolean
		}
	}
}

export async function getSubscriptions(
	page: number,
	limit: number,
): Promise<SubscriptionsResponse> {
	const res = await fetchWithNgrok(`/users/subscriptions?page=${page}&limit=${limit}`, {
		method: 'GET',
	})

	if (!res.ok) throw new Error(`Failed to fetch subscriptions: ${res.status}`)

	return res.json()
}

export function SubscriptionsTable() {
	const t = useTranslations()
	const [currentPage, setCurrentPage] = useState(1)
	const limit = 25

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['subscriptions', currentPage],
		queryFn: () => getSubscriptions(currentPage, limit),
	})

	const formatDate = (dateStr: string) => {
		try {
			return new Date(dateStr).toLocaleDateString()
		} catch {
			return dateStr
		}
	}

	if (isLoading) {
		return (
			<div className='flex justify-center p-8'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		)
	}
	if (isError) {
		return (
			<Alert variant='destructive'>
				<AlertDescription>
					{t('subscriptions.errorLoading') || 'Error loading subscriptions.'}
				</AlertDescription>
			</Alert>
		)
	}

	const subscriptions = data?.data.subscriptions || []
	const pagination = data?.data.pagination

	const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1

	const handlePrev = () => {
		if (currentPage > 1) setCurrentPage(currentPage - 1)
	}

	const handleNext = () => {
		if (currentPage < totalPages) setCurrentPage(currentPage + 1)
	}

	return (
		<div className='space-y-4'>
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('subscriptions.id') || 'ID'}</TableHead>
							<TableHead>{t('subscriptions.userId') || 'User ID'}</TableHead>
							<TableHead>{t('subscriptions.plan') || 'Plan'}</TableHead>
							<TableHead>{t('subscriptions.status') || 'Status'}</TableHead>
							<TableHead>{t('subscriptions.payment') || 'Payment'}</TableHead>
							<TableHead>{t('subscriptions.listings') || 'Listings'}</TableHead>
							<TableHead>
								{t('subscriptions.nextRenewal') || 'Next Renewal'}
							</TableHead>
							<TableHead>{t('subscriptions.created') || 'Created'}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{subscriptions.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={8}
									className='py-8 text-center text-muted-foreground'>
									{t('subscriptions.noSubscriptions') || 'No subscriptions found'}
								</TableCell>
							</TableRow>
						) : (
							subscriptions.map((sub) => (
								<TableRow key={sub.id}>
									<TableCell className='font-medium'>{sub.id}</TableCell>
									<TableCell>{sub.userId}</TableCell>
									<TableCell>
										<Badge>{sub.planId}</Badge>
									</TableCell>
									<TableCell>{sub.status}</TableCell>
									<TableCell>{sub.paymentStatus}</TableCell>
									<TableCell>
										{sub.listingsRemaining > 999999
											? t('subscriptions.unlimited') || 'Unlimited'
											: sub.listingsRemaining.toLocaleString()}
									</TableCell>
									<TableCell>{formatDate(sub.nextRenewal)}</TableCell>
									<TableCell>{formatDate(sub.createdAt)}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{pagination && (
				<>
					<div className='mt-2 flex items-center justify-between'>
						<Button
							onClick={handlePrev}
							disabled={currentPage === 1 || !pagination.prev}
							size='sm'>
							{t('pagination.prev')}
						</Button>
						<span className='text-sm'>
							{t('pagination.page', { number: currentPage })}{' '}
							{t('pagination.of', { number: totalPages })}
						</span>
						<Button
							onClick={handleNext}
							disabled={currentPage === totalPages || !pagination.next}
							size='sm'>
							{t('pagination.next')}
						</Button>
					</div>
					<div className='mt-1 flex justify-between text-sm text-muted-foreground'>
						<div>
							{t('pagination.showing')} {subscriptions.length}{' '}
							{t('subscriptions.itemsName')}
						</div>
						<div>
							{t('pagination.total')}: {pagination.total.toLocaleString()}
						</div>
					</div>
				</>
			)}
		</div>
	)
}
