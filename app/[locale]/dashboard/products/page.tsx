'use client'

import { ProductsTable } from '@/components/products/products-table'
import { useTranslations } from 'next-intl'

export default function ProductsPage() {
	const t = useTranslations()

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-3xl font-bold tracking-tight'>{t('products.title')}</h2>
				<p className='text-muted-foreground'>{t('products.description')}</p>
			</div>

			<ProductsTable />
		</div>
	)
}
