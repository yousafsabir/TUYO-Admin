'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCategory } from '@/lib/api/categories'
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

interface DeleteCategoryDialogProps {
	isOpen: boolean
	onClose: () => void
	categoryName: string | null
	subcategoriesCount: number
}

export function DeleteCategoryDialog({
	isOpen,
	onClose,
	categoryName,
	subcategoriesCount,
}: DeleteCategoryDialogProps) {
	const t = useTranslations()
	const [error, setError] = useState<string | null>(null)
	const queryClient = useQueryClient()

	const { mutate: removeCategory, isPending } = useMutation({
		mutationFn: (name: string) => deleteCategory({ name }),
		onSuccess: () => {
			// Invalidate the categories query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['categories-subcategories'] })
			onClose()
		},
		onError: (error: Error) => {
			setError(error.message || 'Failed to delete category')
		},
	})

	const handleDelete = () => {
		if (categoryName) {
			setError(null)
			removeCategory(categoryName)
		}
	}

	if (!categoryName) return null

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{t('categories.deleteCategory') || 'Delete Category'}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{t('categories.deleteCategoryConfirmation') ||
							'Are you sure you want to delete this category? This action cannot be undone.'}
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
						<span className='font-medium'>{t('categories.name') || 'Name'}:</span>{' '}
						{categoryName}
					</div>
					<div>
						<span className='font-medium'>
							{t('categories.subcategories') || 'Subcategories'}:
						</span>{' '}
						{subcategoriesCount}
					</div>
					{subcategoriesCount > 0 && (
						<div className='mt-2 text-sm text-orange-600'>
							{t('categories.deleteWarning') ||
								'Warning: This will also delete all subcategories in this category.'}
						</div>
					)}
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
