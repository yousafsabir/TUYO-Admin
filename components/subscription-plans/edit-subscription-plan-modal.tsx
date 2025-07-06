'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { updateSubscriptionPlan, type SubscriptionPlan } from '@/lib/api/subscription-plans'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react'

const planFeatureSchema = z.object({
	heading: z.string().min(1, 'Feature heading is required'),
	para: z.string().min(1, 'Feature description is required'),
})

const editSubscriptionPlanSchema = z.object({
	title: z
		.string()
		.min(1, 'Plan title is required')
		.max(100, 'Title must be less than 100 characters'),
	price: z.number().min(0, 'Price must be 0 or greater'),
	subtitle: z.string().nullable(),
	features: z.array(planFeatureSchema).min(1, 'At least one feature is required'),
	listingsLimit: z.number().min(1, 'Listings limit must be at least 1'),
	auctionsAllowed: z.boolean(),
	featuredProductsAllowed: z.boolean(),
	premiumProductsAllowed: z.boolean(),
	stripePriceId: z.string().min(1, 'Stripe Price ID is required'),
})

type EditSubscriptionPlanFormValues = z.infer<typeof editSubscriptionPlanSchema>

interface EditSubscriptionPlanModalProps {
	isOpen: boolean
	onClose: () => void
	plan: SubscriptionPlan | null
}

export function EditSubscriptionPlanModal({
	isOpen,
	onClose,
	plan,
}: EditSubscriptionPlanModalProps) {
	const [error, setError] = useState<string | null>(null)
	const queryClient = useQueryClient()
	const t = useTranslations()

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		control,
		formState: { errors },
	} = useForm<EditSubscriptionPlanFormValues>({
		resolver: zodResolver(editSubscriptionPlanSchema),
	})

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'features',
	})

	// Set form values when plan changes
	useEffect(() => {
		if (plan) {
			setValue('title', plan.title)
			setValue('price', plan.price)
			setValue('subtitle', plan.subtitle || '')
			setValue('features', plan.features)
			setValue('listingsLimit', plan.listingsLimit)
			setValue('auctionsAllowed', plan.auctionsAllowed)
			setValue('featuredProductsAllowed', plan.featuredProductsAllowed)
			setValue('premiumProductsAllowed', plan.premiumProductsAllowed)
			setValue('stripePriceId', plan.stripePriceId)
		}
	}, [plan, setValue])

	const { mutate: editPlan, isPending } = useMutation({
		mutationFn: updateSubscriptionPlan,
		onSuccess: () => {
			// Invalidate the subscription plans query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })

			// Reset form and close modal
			reset()
			onClose()
		},
		onError: (error: Error) => {
			setError(error.message || 'Failed to update subscription plan')
		},
	})

	const onSubmit = (data: EditSubscriptionPlanFormValues) => {
		if (!plan) return

		setError(null)
		editPlan({
			id: plan.id,
			title: data.title,
			price: data.price,
			subtitle: data.subtitle || null,
			features: data.features,
			listingsLimit: data.listingsLimit,
			auctionsAllowed: data.auctionsAllowed,
			featuredProductsAllowed: data.featuredProductsAllowed,
			premiumProductsAllowed: data.premiumProductsAllowed,
			stripePriceId: data.stripePriceId,
		})
	}

	const handleClose = () => {
		if (!isPending) {
			reset()
			setError(null)
			onClose()
		}
	}

	const addFeature = () => {
		append({ heading: '', para: '' })
	}

	const removeFeature = (index: number) => {
		remove(index)
	}

	if (!plan) return null

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-[600px]'>
				<DialogHeader>
					<DialogTitle>
						{t('subscriptionPlans.editPlan') || 'Edit Subscription Plan'}
					</DialogTitle>
					<DialogDescription>
						{t('subscriptionPlans.editPlanDescription') ||
							'Update subscription plan details and features.'}
					</DialogDescription>
				</DialogHeader>

				{error && (
					<Alert variant='destructive' className='mb-4'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Current Plan Info */}
				<div className='mb-4 rounded-md bg-muted p-3'>
					<div>
						<p className='font-medium'>{plan.title}</p>
						<p className='text-sm text-muted-foreground'>
							Plan ID: {plan.planId} • ${plan.price}
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
					{/* Basic Information */}
					<div className='space-y-4'>
						<h4 className='font-medium'>Basic Information</h4>

						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='title'>
									{t('subscriptionPlans.title') || 'Title'}
								</Label>
								<Input
									id='title'
									{...register('title')}
									placeholder='Enter plan title'
									className={errors.title ? 'border-red-500' : ''}
								/>
								{errors.title && (
									<p className='text-sm text-red-500'>{errors.title.message}</p>
								)}
							</div>

							<div className='space-y-2'>
								<Label htmlFor='price'>
									{t('subscriptionPlans.price') || 'Price'}
								</Label>
								<Input
									id='price'
									type='number'
									step='0.01'
									{...register('price', { valueAsNumber: true })}
									placeholder='0.00'
									className={errors.price ? 'border-red-500' : ''}
								/>
								{errors.price && (
									<p className='text-sm text-red-500'>{errors.price.message}</p>
								)}
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='subtitle'>
								{t('subscriptionPlans.subtitle') || 'Subtitle'}
							</Label>
							<Input
								id='subtitle'
								{...register('subtitle')}
								placeholder='Enter plan subtitle (optional)'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='stripePriceId'>
								{t('subscriptionPlans.stripePriceId') || 'Stripe Price ID'}
							</Label>
							<Input
								id='stripePriceId'
								{...register('stripePriceId')}
								placeholder='price_...'
								className={errors.stripePriceId ? 'border-red-500' : ''}
							/>
							{errors.stripePriceId && (
								<p className='text-sm text-red-500'>
									{errors.stripePriceId.message}
								</p>
							)}
						</div>
					</div>

					{/* Limits and Permissions */}
					<div className='space-y-4'>
						<h4 className='font-medium'>Limits & Permissions</h4>

						<div className='space-y-2'>
							<Label htmlFor='listingsLimit'>
								{t('subscriptionPlans.listingsLimit') || 'Listings Limit'}
							</Label>
							<Input
								id='listingsLimit'
								type='number'
								{...register('listingsLimit', { valueAsNumber: true })}
								placeholder='999999999'
								className={errors.listingsLimit ? 'border-red-500' : ''}
							/>
							{errors.listingsLimit && (
								<p className='text-sm text-red-500'>
									{errors.listingsLimit.message}
								</p>
							)}
						</div>

						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>
										{t('subscriptionPlans.auctionsAllowed') ||
											'Auctions Allowed'}
									</Label>
									<div className='text-sm text-muted-foreground'>
										Allow users to create auction listings
									</div>
								</div>
								<Switch {...register('auctionsAllowed')} />
							</div>

							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>
										{t('subscriptionPlans.featuredProductsAllowed') ||
											'Featured Products Allowed'}
									</Label>
									<div className='text-sm text-muted-foreground'>
										Allow products to be featured
									</div>
								</div>
								<Switch {...register('featuredProductsAllowed')} />
							</div>

							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>
										{t('subscriptionPlans.premiumProductsAllowed') ||
											'Premium Products Allowed'}
									</Label>
									<div className='text-sm text-muted-foreground'>
										Allow products to be marked as premium
									</div>
								</div>
								<Switch {...register('premiumProductsAllowed')} />
							</div>
						</div>
					</div>

					{/* Features */}
					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<h4 className='font-medium'>Features</h4>
							<Button type='button' variant='outline' size='sm' onClick={addFeature}>
								<Plus className='mr-1 h-4 w-4' />
								Add Feature
							</Button>
						</div>

						<div className='space-y-3'>
							{fields.map((field, index) => (
								<div key={field.id} className='space-y-3 rounded-md border p-3'>
									<div className='flex items-center justify-between'>
										<h5 className='text-sm font-medium'>Feature {index + 1}</h5>
										{fields.length > 1 && (
											<Button
												type='button'
												variant='ghost'
												size='sm'
												onClick={() => removeFeature(index)}
												className='text-destructive hover:text-destructive'>
												<Trash2 className='h-4 w-4' />
											</Button>
										)}
									</div>

									<div className='space-y-2'>
										<Label htmlFor={`features.${index}.heading`}>Heading</Label>
										<Input
											{...register(`features.${index}.heading`)}
											placeholder='Feature heading'
											className={
												errors.features?.[index]?.heading
													? 'border-red-500'
													: ''
											}
										/>
										{errors.features?.[index]?.heading && (
											<p className='text-sm text-red-500'>
												{errors.features[index]?.heading?.message}
											</p>
										)}
									</div>

									<div className='space-y-2'>
										<Label htmlFor={`features.${index}.para`}>
											Description
										</Label>
										<Textarea
											{...register(`features.${index}.para`)}
											placeholder='Feature description'
											className={
												errors.features?.[index]?.para
													? 'border-red-500'
													: ''
											}
											rows={2}
										/>
										{errors.features?.[index]?.para && (
											<p className='text-sm text-red-500'>
												{errors.features[index]?.para?.message}
											</p>
										)}
									</div>
								</div>
							))}
						</div>

						{errors.features && (
							<p className='text-sm text-red-500'>{errors.features.message}</p>
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
