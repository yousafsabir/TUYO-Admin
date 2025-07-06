'use client'

import { useState } from 'react'
import { AdminsTable } from '@/components/admins/admins-table'
import { AddAdminModal } from '@/components/admins/add-admin-modal'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { useAuth } from '@/lib/context/auth-context'
import { ROOT_ADMIN_EMAIL } from '@/lib/constants'
import { useTranslations } from 'next-intl'

export default function AdminsPage() {
	const [isAddModalOpen, setIsAddModalOpen] = useState(false)
	const t = useTranslations()
	const { user } = useAuth()

	// Check if current user is root admin
	const isRootAdmin = user?.email === ROOT_ADMIN_EMAIL

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>{t('admin.title')}</h2>
					<p className='text-muted-foreground'>{t('admin.description')}</p>
				</div>
				{isRootAdmin && (
					<Button onClick={() => setIsAddModalOpen(true)}>
						<PlusCircle className='mr-2 h-4 w-4' />
						{t('admin.addAdmin')}
					</Button>
				)}
			</div>

			<AdminsTable />

			{/* Add Admin Modal - Only show for root admin */}
			{isRootAdmin && (
				<AddAdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
			)}
		</div>
	)
}
