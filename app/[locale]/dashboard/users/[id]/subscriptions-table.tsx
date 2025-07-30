'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

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
			nextPage: boolean
			prevPage: boolean
		}
	}
}

// Query hook
const useUserSubscriptions = (userId: string, page: number = 1, limit: number = 25) => {
	return useQuery<SubscriptionsResponse>({
		queryKey: ['user-subscriptions', userId, page, limit],
		queryFn: async () => {
			const params = new URLSearchParams({
				userId: userId,
				page: page.toString(),
				limit: limit.toString(),
			})
			const response = await fetchWithNgrok(`/users/subscriptions?${params.toString()}`, {
				method: 'GET',
			})
			if (!response.ok) {
				throw new Error(`Failed to fetch user subscriptions: ${response.status}`)
			}
			return response.json()
		},
		enabled: !isNaN(parseInt(userId, 10)),
	})
}

// Utility functions
const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString()
}

// Pagination Controls Component
function PaginationControls({
	currentPage,
	pagination,
	onPageChange,
	isLoading,
}: {
	currentPage: number
	pagination: SubscriptionsResponse['data']['pagination'] | undefined
	onPageChange: (page: number) => void
	isLoading: boolean
}) {
	const t = useTranslations()
	const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1

	return (
		<div className='mt-2 flex items-center justify-between'>
			<Button
				variant='outline'
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage <= 1 || isLoading || !pagination?.prevPage}
				size='sm'>
				{t('pagination.prev')}
			</Button>
			<span className='text-sm text-muted-foreground'>
				{t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
			</span>
			<Button
				variant='outline'
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage >= totalPages || isLoading || !pagination?.nextPage}
				size='sm'>
				{t('pagination.next')}
			</Button>
		</div>
	)
}

export function UsersSubscriptionsTable({ userId }: { userId: string }) {
	const t = useTranslations()
	const [currentPage, setCurrentPage] = useState(1)
	const limit = 25

	const { data, isLoading, isError, error } = useUserSubscriptions(userId, currentPage, limit)

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

	const subscriptions = data?.data?.subscriptions || []
	const pagination = data?.data?.pagination
	const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1

	return (
		<div className='space-y-4'>
			{subscriptions.length > 0 ? (
				<>
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('subscriptions.plan')}</TableHead>
									<TableHead>{t('subscriptions.status')}</TableHead>
									<TableHead>{t('subscriptions.nextRenewal')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{subscriptions.map((subscription) => (
									<TableRow key={subscription.id}>
										<TableCell>
											<span className='font-medium'>
												{subscription.planId}
											</span>
										</TableCell>
										<TableCell>
											<Badge variant='default'>
												{t(
													`subscriptions.status.${subscription.status}` as any,
													{
														defaultValue: subscription.status,
													},
												)}
											</Badge>
										</TableCell>
										<TableCell>
											<span className='text-sm'>
												{formatDate(subscription.nextRenewal)}
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Pagination Controls */}
					<PaginationControls
						currentPage={currentPage}
						pagination={pagination}
						onPageChange={setCurrentPage}
						isLoading={isLoading}
					/>

					{/* Pagination Summary */}
					<div className='flex items-center justify-between text-sm text-muted-foreground'>
						<p>
							{t('pagination.showing')} {subscriptions.length} {t('pagination.of')}{' '}
							{pagination?.total || 0} {t('subscriptions.itemsName')}
						</p>
					</div>
				</>
			) : (
				<div className='py-8 text-center text-muted-foreground'>
					{t('subscriptions.noSubscriptions')}
				</div>
			)}
		</div>
	)
}
