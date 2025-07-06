'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { deleteSubcategory } from '@/lib/api/categories'
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

interface DeleteSubcategoryDialogProps {
	isOpen: boolean
	onClose: () => void
	subcategory: {
		categoryId: number
		categoryName: string
		name: string
	} | null
}

export function DeleteSubcategoryDialog({
	isOpen,
	onClose,
	subcategory,
}: DeleteSubcategoryDialogProps) {
	const [error, setError] = useState<string | null>(null)
	const queryClient = useQueryClient()
	const t = useTranslations()

	const { mutate: removeSubcategory, isPending } = useMutation({
		mutationFn: (data: { categoryId: number; name: string }) => deleteSubcategory(data),
		onSuccess: () => {
			// Invalidate the categories query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['categories-subcategories'] })
			onClose()
		},
		onError: (error: Error) => {
			setError(error.message || 'Failed to delete subcategory')
		},
	})

	const handleDelete = () => {
		if (subcategory) {
			setError(null)
			removeSubcategory({
				categoryId: subcategory.categoryId,
				name: subcategory.name,
			})
		}
	}

	if (!subcategory) return null

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{t('subcategories.deleteSubcategory') || 'Delete Subcategory'}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{t('subcategories.deleteSubcategoryConfirmation') ||
							'Are you sure you want to delete this subcategory? This action cannot be undone.'}
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
						<span className='font-medium'>{t('subcategories.name') || 'Name'}:</span>{' '}
						{subcategory.name}
					</div>
					<div>
						<span className='font-medium'>
							{t('subcategories.category') || 'Category'}:
						</span>{' '}
						{subcategory.categoryName}
					</div>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>
						{t('common.cancel') || 'Cancel'}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isPending}
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
						{isPending ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								{t('common.deleting') || 'Deleting...'}
							</>
						) : (
							t('common.delete') || 'Delete'
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
