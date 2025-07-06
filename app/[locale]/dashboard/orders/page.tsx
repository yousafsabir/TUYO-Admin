'use client'

import { OrdersTable } from '@/components/orders/orders-table'
import { useTranslations } from 'next-intl'

export default async function OrdersPage() {
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
