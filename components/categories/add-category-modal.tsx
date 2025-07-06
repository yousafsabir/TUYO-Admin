'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { createCategory } from '@/lib/api/categories'
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

const categorySchema = z.object({
	name: z
		.string()
		.min(1, 'Category name is required')
		.max(100, 'Category name must be less than 100 characters'),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface AddCategoryModalProps {
	isOpen: boolean
	onClose: () => void
}

export function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
	const t = useTranslations()
	const [error, setError] = useState<string | null>(null)
	const queryClient = useQueryClient()

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CategoryFormValues>({
		resolver: zodResolver(categorySchema),
	})

	const { mutate: addCategory, isPending } = useMutation({
		mutationFn: createCategory,
		onSuccess: () => {
			// Invalidate the categories query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['categories-subcategories'] })

			// Reset form and close modal
			reset()
			onClose()
		},
		onError: (error: Error) => {
			setError(error.message || 'Failed to create category')
		},
	})

	const onSubmit = (data: CategoryFormValues) => {
		setError(null)
		addCategory(data)
	}

	const handleClose = () => {
		if (!isPending) {
			reset()
			setError(null)
			onClose()
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>{t('categories.addCategory') || 'Add Category'}</DialogTitle>
					<DialogDescription>
						{t('categories.addCategoryDescription') || 'Create a new product category.'}
					</DialogDescription>
				</DialogHeader>

				{error && (
					<Alert variant='destructive' className='mb-4'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>{t('categories.name') || 'Category Name'}</Label>
						<Input
							id='name'
							{...register('name')}
							placeholder={t('categories.namePlaceholder') || 'Enter category name'}
							className={errors.name ? 'border-red-500' : ''}
						/>
						{errors.name && (
							<p className='text-sm text-red-500'>{errors.name.message}</p>
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
									{t('common.creating') || 'Creating...'}
								</>
							) : (
								t('common.create') || 'Create'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
