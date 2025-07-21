'use client'

import { AddBrandModal } from '@/components/brands/add-brand-modal'
import { BrandsTable } from '@/components/brands/brands-table'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function BrandsPage() {
	const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false)
	const t = useTranslations()
	return (
		<div>
			<div className='mb-4 flex items-center justify-between'>
				<div>
					<p>{t('brands.description') || 'Manage brands available for products.'}</p>
				</div>
				<Button onClick={() => setIsAddBrandModalOpen(true)}>
					<PlusCircle className='mr-2 h-4 w-4' />
					{t('brands.addBrand') || 'Add Brand'}
				</Button>
			</div>

			<BrandsTable />

			{/* Add Brand Modal */}
			<AddBrandModal
				isOpen={isAddBrandModalOpen}
				onClose={() => setIsAddBrandModalOpen(false)}
			/>
		</div>
	)
}
