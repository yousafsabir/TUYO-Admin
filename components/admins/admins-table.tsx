'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { getAllAdmins, type Admin } from '@/lib/api/auth'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DeleteAdminDialog } from './delete-admin-dialog'
import { useAuth } from '@/lib/context/auth-context'
import { ROOT_ADMIN_EMAIL } from '@/lib/constants'
import { useTranslations } from 'next-intl'

export function AdminsTable() {
	const [page, setPage] = useState(1)
	const [limit] = useState(10)
	const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null)
	const { user } = useAuth()
	const t = useTranslations()

	// Check if current user is root admin
	const isRootAdmin = user?.email === ROOT_ADMIN_EMAIL

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['admins', page, limit],
		queryFn: () => getAllAdmins(page, limit),
	})

	const handlePreviousPage = () => {
		setPage((prev) => Math.max(prev - 1, 1))
	}

	const handleNextPage = () => {
		if (data?.data?.pagination && page < Math.ceil(data.data.pagination.total / limit)) {
			setPage((prev) => prev + 1)
		}
	}

	const handleDeleteClick = (admin: Admin) => {
		setAdminToDelete(admin)
	}

	if (isLoading) {
		return (
			<div className='flex justify-center py-8'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		)
	}

	if (isError) {
		return (
			<Alert variant='destructive' className='my-4'>
				<AlertDescription>
					{error instanceof Error ? error.message : 'Failed to load admins'}
				</AlertDescription>
			</Alert>
		)
	}

	const admins = data?.data?.admins || []
	const pagination = data?.data?.pagination || { page: 1, limit, total: 0 }
	const totalPages = Math.ceil(pagination.total / pagination.limit)

	return (
		<div className='space-y-4'>
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>{t('admin.name')}</TableHead>
							<TableHead>{t('admin.email')}</TableHead>
							<TableHead>{t('admin.createdAt')}</TableHead>
							<TableHead className='text-right'>{t('admin.actions')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{admins.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className='py-8 text-center text-muted-foreground'>
									{t('admin.noAdmins')}
								</TableCell>
							</TableRow>
						) : (
							admins.map((admin: Admin) => (
								<TableRow key={admin.id}>
									<TableCell className='font-medium'>{admin.id}</TableCell>
									<TableCell>{admin.name}</TableCell>
									<TableCell>{admin.email}</TableCell>
									<TableCell>
										{format(new Date(admin.createdAt), 'MMM d, yyyy')}
									</TableCell>
									<TableCell className='text-right'>
										{isRootAdmin ? (
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleDeleteClick(admin)}
												className='text-destructive hover:bg-destructive/10 hover:text-destructive'
												disabled={user?.id === admin.id} // Prevent deleting yourself
											>
												<Trash2 className='mr-1 h-4 w-4' />
												{t('admin.delete')}
											</Button>
										) : (
											<span className='text-sm text-muted-foreground'>
												{t('admin.noPermission')}
											</span>
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{admins.length > 0 && (
				<div className='flex items-center justify-between'>
					<div className='text-sm text-muted-foreground'>
						{t('pagination.showing')} {String((page - 1) * limit + 1)}-
						{String(Math.min(page * limit, pagination.total))} {t('pagination.of')}{' '}
						{String(pagination.total)} {t('admin.itemsName')}
					</div>
					<div className='flex items-center space-x-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={handlePreviousPage}
							disabled={page <= 1}>
							<ChevronLeft className='mr-1 h-4 w-4' />
							{t('pagination.prev')}
						</Button>
						<div className='text-sm'>
							{t('pagination.page')} {page} {t('pagination.of')} {totalPages}
						</div>
						<Button
							variant='outline'
							size='sm'
							onClick={handleNextPage}
							disabled={page >= totalPages}>
							{t('pagination.next')}
							<ChevronRight className='ml-1 h-4 w-4' />
						</Button>
					</div>
				</div>
			)}

			{/* Delete Confirmation Dialog - Only show for root admin */}
			{isRootAdmin && (
				<DeleteAdminDialog
					isOpen={adminToDelete !== null}
					onClose={() => setAdminToDelete(null)}
					admin={adminToDelete}
				/>
			)}
		</div>
	)
}
