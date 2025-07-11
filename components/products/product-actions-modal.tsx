'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteProduct, updateProduct, type Product } from '@/lib/api/products'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { imageUrl } from '@/lib/utils'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface ProductActionsModalProps {
	isOpen: boolean
	onClose: () => void
	product: Product | null
}

export function ProductActionsModal({ isOpen, onClose, product }: ProductActionsModalProps) {
	const t = useTranslations()
	const [error, setError] = useState<string | null>(null)
	const [isPremium, setIsPremium] = useState(false)
	const [isFeatured, setIsFeatured] = useState(false)
	const [status, setStatus] = useState<
		'pending_approval' | 'draft' | 'live' | 'auction_ended' | 'sold' | 'archived'
	>('draft')
	const queryClient = useQueryClient()
	const router = useRouter()

	// Initialize the premium status when product changes
	useEffect(() => {
		if (product) {
			setIsPremium(product.isPremium)
			setIsFeatured(product.isFeatured)
			setStatus(
				product.status as
					| 'pending_approval'
					| 'draft'
					| 'live'
					| 'auction_ended'
					| 'sold'
					| 'archived',
			)
		}
	}, [product])

	const { mutate: updateProductMutation, isPending } = useMutation({
		mutationFn: (data: { isPremium: boolean; isFeatured: boolean; status: string }) => {
			if (!product) throw new Error('No product selected')

			const formData = new FormData()
			formData.append('isPremium', data.isPremium.toString())
			formData.append('isFeatured', data.isFeatured.toString())
			formData.append('status', data.status)

			// Log the FormData contents for debugging
			console.log('Sending FormData with contents:')
			for (const [key, value] of formData.entries()) {
				console.log(`${key}: ${value}`)
			}

			return updateProduct(product.id, formData)
		},
		onSuccess: () => {
			// Invalidate the products query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['products'] })
			onClose()
		},
		onError: (error: Error) => {
			console.error('Update product error:', error)
			setError(error.message || 'Failed to update product')
		},
	})

	const { mutate: deleteProductMutation, isPending: deletePending } = useMutation({
		mutationFn: (id: string) => {
			if (!product) throw new Error('No product selected')

			return deleteProduct(+id)
		},
		onSuccess: () => {
			// Invalidate the products query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['products'] })
			onClose()
		},
		onError: (error: Error) => {
			console.error('Delete product error:', error)
			setError(error.message || 'Failed to delete product')
		},
	})

	const handleEditDetails = () => {
		if (!product) return
		router.push(`/dashboard/products/${product.id}/edit`)
		onClose()
	}

	const handlDelete = () => {
		if (!product) return
		let confirmation = window.confirm(t('common.action-not-reversed'))
		if (confirmation) {
			deleteProductMutation(product.id.toString())
		}
	}

	const handleSave = () => {
		if (!product) return

		setError(null)
		console.log('Saving product with values:', {
			isPremium,
			isFeatured,
			status,
		})
		updateProductMutation({ isPremium, isFeatured, status })
	}

	const handleClose = () => {
		if (!isPending) {
			setError(null)
			if (product) {
				setIsPremium(product.isPremium)
				setIsFeatured(product.isFeatured)
				setStatus(
					product.status as
						| 'pending_approval'
						| 'draft'
						| 'live'
						| 'auction_ended'
						| 'sold'
						| 'archived',
				)
			}
			onClose()
		}
	}

	if (!product) return null

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className=''>
				<DialogHeader>
					<DialogTitle>{t('products.editProduct') || 'Edit Product'}</DialogTitle>
					<DialogDescription>
						{t('products.editProductDescription') ||
							'Update product settings and preferences.'}
					</DialogDescription>
				</DialogHeader>

				{error && (
					<Alert variant='destructive' className='mb-4'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className='space-y-4'>
					{/* Product Info */}
					<div className='rounded-md bg-muted p-3'>
						<div className='flex items-center gap-3'>
							<div className='h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100'>
								{product.images.length > 0 ? (
									<img
										src={imageUrl(product.images[0].url) || '/placeholder.svg'}
										alt={product.title}
										className='h-full w-full object-cover'
									/>
								) : (
									<div className='flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-400'>
										No Image
									</div>
								)}
							</div>
							<div className='min-w-0 flex-1'>
								<p
									className='line-clamp-2 text-sm font-medium'
									title={product.title}>
									{product.title}
								</p>
								<p className='text-xs text-muted-foreground'>
									ID: {product.id} • ${product.price}
								</p>
							</div>
						</div>
					</div>

					{/* Premium Status Toggle */}
					<div className='flex items-center justify-between'>
						<div className='space-y-0.5'>
							<Label htmlFor='premium-toggle' className='text-base'>
								{t('products.premiumStatus') || 'Premium Status'}
							</Label>
							<div className='text-sm text-muted-foreground'>
								{t('products.premiumStatusDescription') ||
									'Mark this product as premium to give it special visibility.'}
							</div>
						</div>
						<Switch
							id='premium-toggle'
							checked={isPremium}
							onCheckedChange={setIsPremium}
							disabled={isPending}
						/>
					</div>

					{/* Featured Status Toggle */}
					<div className='flex items-center justify-between'>
						<div className='space-y-0.5'>
							<Label htmlFor='featured-toggle' className='text-base'>
								{t('products.featuredStatus') || 'Featured Status'}
							</Label>
							<div className='text-sm text-muted-foreground'>
								{t('products.featuredStatusDescription') ||
									'Mark this product as featured to highlight it on the platform.'}
							</div>
						</div>
						<Switch
							id='featured-toggle'
							checked={isFeatured}
							onCheckedChange={setIsFeatured}
							disabled={isPending}
						/>
					</div>

					{/* Status Selector */}
					<div className='space-y-2'>
						<Label htmlFor='status-select' className='text-base'>
							{t('products.status') || 'Product Status'}
						</Label>
						<Select
							value={status}
							onValueChange={(value) => setStatus(value as typeof status)}
							disabled={isPending}>
							<SelectTrigger>
								<SelectValue placeholder='Select status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='pending_approval'>Pending Approval</SelectItem>
								<SelectItem value='draft'>Draft</SelectItem>
								<SelectItem value='live'>Live</SelectItem>
								<SelectItem value='auction_ended'>Auction Ended</SelectItem>
								<SelectItem value='sold'>Sold</SelectItem>
								<SelectItem value='archived'>Archived</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter className='mt-6'>
					<Button
						type='button'
						variant='destructive'
						onClick={handlDelete}
						disabled={deletePending}>
						{deletePending ? t('common.deleting') : t('common.delete')}
					</Button>
					<Button
						type='button'
						variant='secondary'
						onClick={handleEditDetails}
						disabled={isPending}>
						{t('products.editOtherDetails') || 'Edit Other Details'}
					</Button>
					<Button
						type='button'
						variant='outline'
						onClick={handleClose}
						disabled={isPending}>
						{t('common.cancel') || 'Cancel'}
					</Button>
					<Button type='button' onClick={handleSave} disabled={isPending}>
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
			</DialogContent>
		</Dialog>
	)
}
