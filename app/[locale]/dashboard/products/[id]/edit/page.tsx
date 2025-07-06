'use client'

import EditProductForm from './edit-product-form'
import { useTranslations } from 'next-intl'
import { use } from 'react'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const t = useTranslations()

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-3xl font-bold tracking-tight'>
					{t('products.editProduct') || 'Edit Product'}
				</h2>
				<p className='text-muted-foreground'>
					{t('products.editProductDescription') || 'Update product information.'}
				</p>
			</div>

			<EditProductForm productId={Number.parseInt(id)} />
		</div>
	)
}
