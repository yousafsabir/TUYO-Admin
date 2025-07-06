'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAdmin } from '@/lib/api/auth'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface DeleteAdminDialogProps {
	isOpen: boolean
	onClose: () => void
	admin: { id: number; name: string; email: string } | null
}

export function DeleteAdminDialog({ isOpen, onClose, admin }: DeleteAdminDialogProps) {
	const [error, setError] = useState<string | null>(null)
	const queryClient = useQueryClient()
	const t = useTranslations()

	const { mutate: removeAdmin, isPending } = useMutation({
		mutationFn: (id: number) => deleteAdmin(id),
		onSuccess: () => {
			// Invalidate the admins query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['admins'] })
			onClose()
		},
		onError: (error: Error) => {
			setError(error.message || 'Failed to delete admin')
		},
	})

	const handleDelete = () => {
		if (admin) {
			setError(null)
			removeAdmin(admin.id)
		}
	}

	if (!admin) return null

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t('admin.deleteAdmin')}</AlertDialogTitle>
					<AlertDialogDescription>
						{t('admin.deleteAdminConfirmation')}
					</AlertDialogDescription>
				</AlertDialogHeader>

				{error && (
					<Alert variant='destructive' className='mb-4'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className='mt-2 space-y-2 rounded-md bg-muted p-4'>
					<div>
						<span className='font-medium'>{t('admin.name')}:</span> {admin.name}
					</div>
					<div>
						<span className='font-medium'>{t('admin.email')}:</span> {admin.email}
					</div>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>{t('common.cancel')}</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isPending}
						className='bg-destructive text-destructive-foreground'>
						{isPending ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								{t('common.deleting')}
							</>
						) : (
							t('common.delete')
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
