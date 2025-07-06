'use client'

import { SubscriptionsTable } from '@/components/subscriptions/subscriptions-table'
import { useTranslations } from 'next-intl'

export default function SubscriptionsPage() {
	const t = useTranslations()

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold tracking-tight'>
					{t('subscriptions.title') || 'Subscriptions'}
				</h1>
				<p className='text-muted-foreground'>
					{t('subscriptions.description') || 'Manage user subscriptions and plans'}
				</p>
			</div>

			<SubscriptionsTable />
		</div>
	)
}
