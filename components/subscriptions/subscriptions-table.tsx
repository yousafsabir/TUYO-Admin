'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { getSubscriptions, type Subscription } from '@/lib/api/subscriptions'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface SubscriptionsTableProps {}

export function SubscriptionsTable({}: SubscriptionsTableProps) {
	const t = useTranslations()

	const {
		data: subscriptionsData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['subscriptions'],
		queryFn: () => getSubscriptions(),
	})

	const formatDate = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleDateString()
		} catch {
			return dateString
		}
	}

	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case 'active':
				return <Badge className='bg-green-100 text-green-800'>{status}</Badge>
			case 'inactive':
				return <Badge variant='secondary'>{status}</Badge>
			case 'cancelled':
				return <Badge variant='destructive'>{status}</Badge>
			default:
				return <Badge variant='outline'>{status}</Badge>
		}
	}

	const getPaymentStatusBadge = (paymentStatus: string) => {
		switch (paymentStatus.toLowerCase()) {
			case 'paid':
				return <Badge className='bg-green-100 text-green-800'>{paymentStatus}</Badge>
			case 'pending':
				return <Badge className='bg-yellow-100 text-yellow-800'>{paymentStatus}</Badge>
			case 'failed':
				return <Badge variant='destructive'>{paymentStatus}</Badge>
			default:
				return <Badge variant='outline'>{paymentStatus}</Badge>
		}
	}

	if (isLoading) {
		return (
			<div className='flex items-center justify-center p-8'>
				<Loader2 className='h-8 w-8 animate-spin' />
				<span className='ml-2'>{t('common.loading') || 'Loading...'}</span>
			</div>
		)
	}

	if (error) {
		return (
			<Alert variant='destructive'>
				<AlertDescription>
					{t('subscriptions.errorLoading') ||
						'Error loading subscriptions. Please try again.'}
				</AlertDescription>
			</Alert>
		)
	}

	const subscriptions = subscriptionsData?.data?.subscriptions || []

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
							subscriptions.map((subscription: Subscription) => (
								<TableRow key={subscription.id}>
									<TableCell className='font-medium'>{subscription.id}</TableCell>
									<TableCell>{subscription.userId}</TableCell>
									<TableCell>
										<Badge variant='outline'>{subscription.planId}</Badge>
									</TableCell>
									<TableCell>{getStatusBadge(subscription.status)}</TableCell>
									<TableCell>
										{getPaymentStatusBadge(subscription.paymentStatus)}
									</TableCell>
									<TableCell>
										{subscription.listingsRemaining > 999999
											? t('subscriptions.unlimited') || 'Unlimited'
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

			{subscriptionsData?.data?.pagination && (
				<div className='flex items-center justify-between text-sm text-muted-foreground'>
					<div>
						{t('subscriptions.showing') || 'Showing'} {subscriptions.length}{' '}
						{t('subscriptions.of') || 'of'} {subscriptionsData.data.pagination.total}{' '}
						{t('subscriptions.subscriptions') || 'subscriptions'}
					</div>
					<div>
						{t('subscriptions.page') || 'Page'} {subscriptionsData.data.pagination.page}
					</div>
				</div>
			)}
		</div>
	)
}
