'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { updateBrand, type Brand } from '@/lib/api/brands'
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
import { imageUrl } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const editBrandSchema = z.object({
	newName: z
		.string()
		.min(1, 'Brand name is required')
		.max(100, 'Brand name must be less than 100 characters'),
})

type EditBrandFormValues = z.infer<typeof editBrandSchema>

interface EditBrandModalProps {
	isOpen: boolean
	onClose: () => void
	brand: Brand | null
}

export function EditBrandModal({ isOpen, onClose, brand }: EditBrandModalProps) {
	const t = useTranslations()
	const [error, setError] = useState<string | null>(null)
	const queryClient = useQueryClient()

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<EditBrandFormValues>({
		resolver: zodResolver(editBrandSchema),
	})

	// Set form values when brand changes
	useEffect(() => {
		if (brand) {
			setValue('newName', brand.name)
		}
	}, [brand, setValue])

	const { mutate: editBrand, isPending } = useMutation({
		mutationFn: updateBrand,
		onSuccess: () => {
			// Invalidate the brands query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['brands'] })

			// Reset form and close modal
			reset()
			onClose()
		},
		onError: (error: Error) => {
			setError(error.message || 'Failed to update brand')
		},
	})

	const onSubmit = (data: EditBrandFormValues) => {
		if (!brand) return

		setError(null)
		editBrand({
			name: brand.name,
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

	if (!brand) return null

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>{t('brands.editBrand') || 'Edit Brand'}</DialogTitle>
					<DialogDescription>
						{t('brands.editBrandDescription') || 'Update the brand name.'}
					</DialogDescription>
				</DialogHeader>

				{error && (
					<Alert variant='destructive' className='mb-4'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Current Brand Info */}
				<div className='mb-4 rounded-md bg-muted p-3'>
					<div className='flex items-center gap-3'>
						<img
							src={imageUrl(brand.imageUrl) || '/placeholder.svg'}
							alt={brand.name}
							className='h-12 w-12 rounded-md bg-white object-contain'
						/>
						<div>
							<p className='font-medium'>{brand.name}</p>
							<p className='text-sm text-muted-foreground'>Current brand</p>
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='newName'>{t('brands.newName') || 'New Brand Name'}</Label>
						<Input
							id='newName'
							{...register('newName')}
							placeholder={t('brands.namePlaceholder') || 'Enter brand name'}
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
