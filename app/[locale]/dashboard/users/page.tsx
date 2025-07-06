'use client'

import { UsersTable } from '@/components/users/users-table'
import { useTranslations } from 'next-intl'

export default function UsersPage() {
	const t = useTranslations()

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-3xl font-bold tracking-tight'>{t('users.title') || 'Users'}</h2>
				<p className='text-muted-foreground'>
					{t('users.description') || 'Manage user accounts.'}
				</p>
			</div>

			<UsersTable />
		</div>
	)
}
