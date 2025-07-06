'use client'

import AddProductForm from './add-product-form'
import { useTranslations } from 'next-intl'

export default function AddProductPage() {
	const t = useTranslations()

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-3xl font-bold tracking-tight'>
					{t('products.addProduct') || 'Add Product'}
				</h2>
				<p className='text-muted-foreground'>
					{t('products.addDescription') || 'Create a new product listing.'}
				</p>
			</div>

			<AddProductForm />
		</div>
	)
}
