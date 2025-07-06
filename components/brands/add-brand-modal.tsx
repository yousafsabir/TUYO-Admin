'use client'

import type React from 'react'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { createBrand } from '@/lib/api/brands'
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
import { AlertCircle, Loader2, Upload, X } from 'lucide-react'

const brandSchema = z.object({
	name: z
		.string()
		.min(1, 'Brand name is required')
		.max(100, 'Brand name must be less than 100 characters'),
	image: z.instanceof(File, { message: 'Brand image is required' }),
})

type BrandFormValues = z.infer<typeof brandSchema>

interface AddBrandModalProps {
	isOpen: boolean
	onClose: () => void
}

export function AddBrandModal({ isOpen, onClose }: AddBrandModalProps) {
	const [error, setError] = useState<string | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const queryClient = useQueryClient()
	const t = useTranslations()

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<BrandFormValues>({
		resolver: zodResolver(brandSchema),
	})

	const selectedImage = watch('image')

	const { mutate: addBrand, isPending } = useMutation({
		mutationFn: createBrand,
		onSuccess: () => {
			// Invalidate the brands query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['brands'] })

			// Reset form and close modal
			reset()
			setImagePreview(null)
			onClose()
		},
		onError: (error: Error) => {
			setError(error.message || 'Failed to create brand')
		},
	})

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			setValue('image', file)

			// Create preview
			const reader = new FileReader()
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const removeImage = () => {
		setValue('image', undefined as any)
		setImagePreview(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const onSubmit = (data: BrandFormValues) => {
		setError(null)
		addBrand(data)
	}

	const handleClose = () => {
		if (!isPending) {
			reset()
			setImagePreview(null)
			setError(null)
			onClose()
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>{t('brands.addBrand') || 'Add Brand'}</DialogTitle>
					<DialogDescription>
						{t('brands.addBrandDescription') ||
							'Create a new brand with name and image.'}
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
						<Label htmlFor='name'>{t('brands.name') || 'Brand Name'}</Label>
						<Input
							id='name'
							{...register('name')}
							placeholder={t('brands.namePlaceholder') || 'Enter brand name'}
							className={errors.name ? 'border-red-500' : ''}
						/>
						{errors.name && (
							<p className='text-sm text-red-500'>{errors.name.message}</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='image'>{t('brands.image') || 'Brand Image'}</Label>
						<div className='space-y-2'>
							{imagePreview ? (
								<div className='relative'>
									<img
										src={imagePreview || '/placeholder.svg'}
										alt='Brand preview'
										className='h-32 w-full rounded-md border bg-gray-50 object-contain'
									/>
									<Button
										type='button'
										variant='destructive'
										size='sm'
										className='absolute right-2 top-2'
										onClick={removeImage}>
										<X className='h-4 w-4' />
									</Button>
								</div>
							) : (
								<div
									className='cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400'
									onClick={() => fileInputRef.current?.click()}>
									<Upload className='mx-auto h-8 w-8 text-gray-400' />
									<p className='mt-2 text-sm text-gray-600'>
										{t('brands.uploadImage') || 'Click to upload brand image'}
									</p>
									<p className='text-xs text-gray-500'>
										PNG, JPG, GIF up to 10MB
									</p>
								</div>
							)}
							<Input
								ref={fileInputRef}
								type='file'
								accept='image/*'
								onChange={handleImageChange}
								className='hidden'
							/>
						</div>
						{errors.image && (
							<p className='text-sm text-red-500'>{errors.image.message}</p>
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
