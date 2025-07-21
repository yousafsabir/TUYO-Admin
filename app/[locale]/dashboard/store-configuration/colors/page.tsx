'use client'

import { useState } from 'react'
import { AddColorModal } from '@/components/colors/add-color-modal'
import { ColorsTable } from '@/components/colors/colors-table'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ColorsPage() {
	const [isAddColorModalOpen, setIsAddColorModalOpen] = useState(false)

	const t = useTranslations()
	return (
		<div>
			<div className='flex items-center justify-between'>
				<div>
					<p>{t('colors.description') || 'Manage colors available for products.'}</p>
				</div>
				<Button onClick={() => setIsAddColorModalOpen(true)}>
					<PlusCircle className='mr-2 h-4 w-4' />
					{t('colors.addColor') || 'Add Color'}
				</Button>
			</div>
			<ColorsTable />

			{/* Add Color Modal */}
			<AddColorModal
				isOpen={isAddColorModalOpen}
				onClose={() => setIsAddColorModalOpen(false)}
			/>
		</div>
	)
}
