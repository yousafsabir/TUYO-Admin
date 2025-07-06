'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { updateCategory } from '@/lib/api/categories'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

const editCategorySchema = z.object({
	newName: z
		.string()
		.min(1, 'Category name is required')
		.max(100, 'Category name must be less than 100 characters'),
})

type EditCategoryFormValues = z.infer<typeof editCategorySchema>

interface EditCategoryModalProps {
	isOpen: boolean
	onClose: () => void
	categoryName: string | null
}

export function EditCategoryModal({ isOpen, onClose, categoryName }: EditCategoryModalProps) {
	const t = useTranslations()
	const [error, setError] = useState<string | null>(null)
	const queryClient = useQueryClient()

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<EditCategoryFormValues>({
		resolver: zodResolver(editCategorySchema),
	})

	// Set form values when category changes
	useEffect(() => {
		if (categoryName) {
			setValue('newName', categoryName)
		}
	}, [categoryName, setValue])

	const { mutate: editCategory, isPending } = useMutation({
		mutationFn: updateCategory,
		onSuccess: () => {
			// Invalidate the categories query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['categories-subcategories'] })

			// Reset form and close modal
			reset()
			onClose()
		},
		onError: (error: Error) => {
			setError(error.message || 'Failed to update category')
		},
	})

	const onSubmit = (data: EditCategoryFormValues) => {
		if (!categoryName) return

		setError(null)
		editCategory({
			name: categoryName,
			newName: data.newName,
		})
	}

	const handleClose = () => {
		if (!isPending) {
			reset()
			setError(null)
			onClose()
		}
	}

	if (!categoryName) return null

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>{t('categories.editCategory') || 'Edit Category'}</DialogTitle>
					<DialogDescription>
						{t('categories.editCategoryDescription') || 'Update the category name.'}
					</DialogDescription>
				</DialogHeader>

				{error && (
					<Alert variant='destructive' className='mb-4'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Current Category Info */}
				<div className='mb-4 rounded-md bg-muted p-3'>
					<div>
						<p className='font-medium'>{categoryName}</p>
						<p className='text-sm text-muted-foreground'>Current category</p>
					</div>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='newName'>
							{t('categories.newName') || 'New Category Name'}
						</Label>
						<Input
							id='newName'
							{...register('newName')}
							placeholder={t('categories.namePlaceholder') || 'Enter category name'}
							className={errors.newName ? 'border-red-500' : ''}
						/>
						{errors.newName && (
							<p className='text-sm text-red-500'>{errors.newName.message}</p>
						)}
					</div>

					<DialogFooter className='mt-6'>
						<Button
							type='button'
							variant='outline'
							onClick={handleClose}
							disabled={isPending}>
							{t('common.cancel') || 'Cancel'}
						</Button>
						<Button type='submit' disabled={isPending}>
							{isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									{t('common.saving') || 'Saving...'}
								</>
							) : (
								t('common.save') || 'Save'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
