'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteBrand, type Brand } from '@/lib/api/brands'
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
import { imageUrl } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface DeleteBrandDialogProps {
	isOpen: boolean
	onClose: () => void
	brand: Brand | null
}

export function DeleteBrandDialog({ isOpen, onClose, brand }: DeleteBrandDialogProps) {
	const t = useTranslations()
	const [error, setError] = useState<string | null>(null)
	const queryClient = useQueryClient()

	const { mutate: removeBrand, isPending } = useMutation({
		mutationFn: (name: string) => deleteBrand({ name }),
		onSuccess: () => {
			// Invalidate the brands query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['brands'] })
			onClose()
		},
		onError: (error: Error) => {
			setError(error.message || 'Failed to delete brand')
		},
	})

	const handleDelete = () => {
		if (brand) {
			setError(null)
			removeBrand(brand.name)
		}
	}

	if (!brand) return null

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t('brands.deleteBrand') || 'Delete Brand'}</AlertDialogTitle>
					<AlertDialogDescription>
						{t('brands.deleteBrandConfirmation') ||
							'Are you sure you want to delete this brand? This action cannot be undone.'}
					</AlertDialogDescription>
				</AlertDialogHeader>

				{error && (
					<Alert variant='destructive' className='mb-4'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className='mt-2 space-y-2 rounded-md bg-muted p-4'>
					<div className='flex items-center gap-3'>
						<img
							src={imageUrl(brand.imageUrl) || '/placeholder.svg'}
							alt={brand.name}
							className='h-12 w-12 rounded-md bg-white object-contain'
						/>
						<div>
							<span className='font-medium'>{t('brands.name') || 'Name'}:</span>{' '}
							{brand.name}
						</div>
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
