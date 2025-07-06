'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { BrandsTable } from '@/components/brands/brands-table'
import { AddBrandModal } from '@/components/brands/add-brand-modal'
import { CategoriesSubcategoriesTable } from '@/components/categories/categories-subcategories-table'
import { SubscriptionPlansTable } from '@/components/subscription-plans/subscription-plans-table'
import { ColorsTable } from '@/components/colors/colors-table'
import { AddColorModal } from '@/components/colors/add-color-modal'
import { useTranslations } from 'next-intl'

export function StoreConfigurationForm() {
	const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false)
	const [isAddColorModalOpen, setIsAddColorModalOpen] = useState(false)
	const t = useTranslations()

	return (
		<div className='space-y-6'>
			{/* Brands Section */}
			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle>{t('brands.title') || 'Brands'}</CardTitle>
							<CardDescription>
								{t('brands.description') || 'Manage brands available for products.'}
							</CardDescription>
						</div>
						<Button onClick={() => setIsAddBrandModalOpen(true)}>
							<PlusCircle className='mr-2 h-4 w-4' />
							{t('brands.addBrand') || 'Add Brand'}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<BrandsTable />
				</CardContent>
			</Card>

			{/* Categories/Subcategories Section */}
			<Card>
				<CardHeader>
					<div>
						<CardTitle>
							{t('categories.title') || 'Categories & Subcategories'}
						</CardTitle>
						<CardDescription>
							{t('categories.description') ||
								'Manage product categories and their subcategories.'}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<CategoriesSubcategoriesTable />
				</CardContent>
			</Card>

			{/* Subscription Plans Section */}
			<Card>
				<CardHeader>
					<div>
						<CardTitle>
							{t('subscriptionPlans.title') || 'Subscription Plans'}
						</CardTitle>
						<CardDescription>
							{t('subscriptionPlans.description') ||
								'Manage subscription plans and their features.'}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<SubscriptionPlansTable />
				</CardContent>
			</Card>

			{/* Colors Section */}
			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle>{t('colors.title') || 'Colors'}</CardTitle>
							<CardDescription>
								{t('colors.description') || 'Manage colors available for products.'}
							</CardDescription>
						</div>
						<Button onClick={() => setIsAddColorModalOpen(true)}>
							<PlusCircle className='mr-2 h-4 w-4' />
							{t('colors.addColor') || 'Add Color'}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<ColorsTable />
				</CardContent>
			</Card>

			{/* Add Brand Modal */}
			<AddBrandModal
				isOpen={isAddBrandModalOpen}
				onClose={() => setIsAddBrandModalOpen(false)}
			/>

			{/* Add Color Modal */}
			<AddColorModal
				isOpen={isAddColorModalOpen}
				onClose={() => setIsAddColorModalOpen(false)}
			/>
		</div>
	)
}
