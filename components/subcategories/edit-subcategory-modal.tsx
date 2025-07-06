'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { updateSubcategory } from '@/lib/api/categories'
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
	subcategoriesIcons,
	getSubcategoryIconLabel,
	type SubcategoryIconKey,
} from '@/lib/subcategories-icons'
import { useTranslations } from 'next-intl'

const subcategorySchema = z.object({
	categoryId: z.number().min(1, 'Category is required'),
	name: z.string().min(1, 'Current subcategory name is required'),
	newName: z
		.string()
		.min(1, 'New subcategory name is required')
		.max(100, 'Subcategory name must be less than 100 characters'),
	iconKey: z.string().min(1, 'Icon is required'),
})

type SubcategoryFormValues = z.infer<typeof subcategorySchema>

interface EditSubcategoryModalProps {
	isOpen: boolean
	onClose: () => void
	subcategory: {
		name: string
		iconKey: string
		categoryId: number
	} | null
}

export function EditSubcategoryModal({ isOpen, onClose, subcategory }: EditSubcategoryModalProps) {
	const t = useTranslations()
	const [error, setError] = useState<string | null>(null)
	const queryClient = useQueryClient()

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<SubcategoryFormValues>({
		resolver: zodResolver(subcategorySchema),
	})

	const selectedIconKey = watch('iconKey')

	// Set form values when subcategory changes
	useEffect(() => {
		if (subcategory) {
			setValue('categoryId', subcategory.categoryId)
			setValue('name', subcategory.name)
			setValue('newName', subcategory.name)
			setValue('iconKey', subcategory.iconKey)
		}
	}, [subcategory, setValue])

	const { mutate: editSubcategory, isPending } = useMutation({
		mutationFn: updateSubcategory,
		onSuccess: () => {
			// Invalidate the categories query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['categories-subcategories'] })

			// Reset form and close modal
			reset()
			onClose()
		},
		onError: (error: Error) => {
			setError(error.message || 'Failed to update subcategory')
		},
	})

	const onSubmit = (data: SubcategoryFormValues) => {
		setError(null)
		editSubcategory(data)
	}

	const handleClose = () => {
		if (!isPending) {
			reset()
			setError(null)
			onClose()
		}
	}

	if (!subcategory) return null

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>
						{t('subcategories.editSubcategory') || 'Edit Subcategory'}
					</DialogTitle>
					<DialogDescription>
						{t('subcategories.editSubcategoryDescription') ||
							'Update the subcategory name and icon.'}
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
						<Label htmlFor='currentName'>
							{t('subcategories.currentName') || 'Current Name'}
						</Label>
						<Input
							id='currentName'
							value={subcategory.name}
							disabled
							className='bg-muted'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='newName'>{t('subcategories.newName') || 'New Name'}</Label>
						<Input
							id='newName'
							{...register('newName')}
							placeholder={
								t('subcategories.newNamePlaceholder') ||
								'Enter new subcategory name'
							}
							className={errors.newName ? 'border-red-500' : ''}
						/>
						{errors.newName && (
							<p className='text-sm text-red-500'>{errors.newName.message}</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='iconKey'>{t('subcategories.icon') || 'Icon'}</Label>
						<div className='mb-2 flex items-center gap-2'>
							<span className='text-sm text-muted-foreground'>Current icon:</span>
							<div className='flex h-4 w-4 items-center justify-center'>
								{subcategoriesIcons[subcategory.iconKey as SubcategoryIconKey]}
							</div>
							<span className='text-sm'>
								{getSubcategoryIconLabel(subcategory.iconKey as SubcategoryIconKey)}
							</span>
						</div>
						<Select
							onValueChange={(value) => setValue('iconKey', value)}
							value={selectedIconKey}>
							<SelectTrigger className={errors.iconKey ? 'border-red-500' : ''}>
								<SelectValue
									placeholder={t('subcategories.selectIcon') || 'Select an icon'}
								/>
							</SelectTrigger>
							<SelectContent>
								{Object.keys(subcategoriesIcons).map((key) => (
									<SelectItem key={key} value={key}>
										<div className='flex items-center gap-2'>
											<div className='flex h-4 w-4 items-center justify-center'>
												{subcategoriesIcons[key as SubcategoryIconKey]}
											</div>
											{getSubcategoryIconLabel(key as SubcategoryIconKey)}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.iconKey && (
							<p className='text-sm text-red-500'>{errors.iconKey.message}</p>
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
									{t('common.updating') || 'Updating...'}
								</>
							) : (
								t('common.update') || 'Update'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
