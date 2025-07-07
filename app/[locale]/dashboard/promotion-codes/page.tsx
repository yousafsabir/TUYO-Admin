'use client'

import { Locale, useLocale, useTranslations } from 'next-intl'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { copyTextToClipboard } from '@/lib/utils'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Copy, RefreshCw, Filter, X, Plus } from 'lucide-react'
import React, { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// TypeScript types
type PromotionCode = {
	id: string
	code: string
	couponId: string
	active: boolean
	maxRedemptions: number | null
	timesRedeemed: number
	restrictions: {
		first_time_transaction: boolean
		minimum_amount: number | null
		minimum_amount_currency: string | null
	}
	expiresAt: number | null
	created: number
	appliesTo: string
	status: {
		usable: boolean
		expired: boolean
		exhausted: boolean
	}
	coupon: {
		id: string
		name: string
		percentOff: number | null
		amountOff: number | null
		currency: string
		duration: string
		durationInMonths: number | null
		timesRedeemed: number
		valid: boolean
		created: number
	}
}

type Coupon = {
	id: string
	name: string
	percentOff: number | null
	amountOff: number | null
	currency: string
	duration: string
	durationInMonths: number | null
	timesRedeemed: number
	valid: boolean
	created: number
}

type ApiResponse<T> = {
	status: string
	statusCode: number
	message: string
	data: T
}

type PromotionCodeFilters = {
	active?: boolean
	code?: string
	coupon?: string
	created?: {
		gt?: number
		gte?: number
		lt?: number
		lte?: number
	}
}

type CouponFilters = {
	created?: {
		gt?: number
		gte?: number
		lt?: number
		lte?: number
	}
}

// Zod schemas for coupon creation
const discountTypeSchema = z.enum(['percent', 'amount'])
const couponDurationSchema = z.enum(['once', 'repeating', 'forever'])

const createCouponSchema = z
	.object({
		id: z.string().min(1, 'ID is required').max(50, 'ID must be 50 characters or less'),
		name: z
			.string()
			.min(1, 'Name is required')
			.max(255, 'Name must be 255 characters or less')
			.optional(),
		discountType: discountTypeSchema,
		amount: z.number().min(1, 'Amount must be at least 1'),
		duration: couponDurationSchema,
		durationInMonths: z.number().min(1).max(12).optional(),
	})
	.superRefine(({ duration, durationInMonths, discountType, amount }, ctx) => {
		if (duration === 'repeating' && !durationInMonths) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Duration in months is required when duration is 'repeating'",
				path: ['durationInMonths'],
			})
		}
		if (discountType === 'percent' && amount > 100) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Amount must not be greater than 100 when discount type is 'percent'",
				path: ['amount'],
			})
		}
	})

type CreateCouponFormData = z.infer<typeof createCouponSchema>

// Custom hooks
const usePromotionCodes = (filters: PromotionCodeFilters = {}) => {
	return useQuery<ApiResponse<PromotionCode[]>>({
		queryKey: ['promotion-codes', filters],
		queryFn: async () => {
			const params = new URLSearchParams()

			// Add filter params
			if (filters.active !== undefined) {
				params.append('active', filters.active.toString())
			}
			if (filters.code) {
				params.append('code', filters.code)
			}
			if (filters.coupon) {
				params.append('coupon', filters.coupon)
			}
			if (filters.created) {
				if (filters.created.gt) params.append('created[gt]', filters.created.gt.toString())
				if (filters.created.gte)
					params.append('created[gte]', filters.created.gte.toString())
				if (filters.created.lt) params.append('created[lt]', filters.created.lt.toString())
				if (filters.created.lte)
					params.append('created[lte]', filters.created.lte.toString())
			}

			const url = `/stripe/promotion-codes${params.toString() ? `?${params.toString()}` : ''}`
			const response = await fetchWithNgrok(url)
			if (!response.ok) {
				throw new Error('Failed to fetch promotion codes')
			}
			return response.json()
		},
	})
}

const useCoupons = (filters: CouponFilters = {}) => {
	return useQuery<ApiResponse<Coupon[]>>({
		queryKey: ['coupons', filters],
		queryFn: async () => {
			const params = new URLSearchParams()

			// Add filter params
			if (filters.created) {
				if (filters.created.gt) params.append('created[gt]', filters.created.gt.toString())
				if (filters.created.gte)
					params.append('created[gte]', filters.created.gte.toString())
				if (filters.created.lt) params.append('created[lt]', filters.created.lt.toString())
				if (filters.created.lte)
					params.append('created[lte]', filters.created.lte.toString())
			}

			const url = `/stripe/coupons${params.toString() ? `?${params.toString()}` : ''}`
			const response = await fetchWithNgrok(url)
			if (!response.ok) {
				throw new Error('Failed to fetch coupons')
			}
			return response.json()
		},
	})
}

// Create coupon mutation
const useCreateCoupon = () => {
	const queryClient = useQueryClient()
	const { toast } = useToast()

	return useMutation({
		mutationFn: async (data: CreateCouponFormData) => {
			const response = await fetchWithNgrok('/stripe/coupons', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Failed to create coupon')
			}

			return response.json()
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['coupons'] })
			toast({
				title: 'Success',
				description: 'Coupon created successfully',
				variant: 'default',
			})
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			})
		},
	})
}

// Format date helper
const formatDate = (timestamp: number, locale: Locale) => {
	return new Date(timestamp * 1000).toLocaleDateString(locale === 'en' ? 'en-US' : locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

// Add Coupon Modal Component
function AddCouponModal() {
	const t = useTranslations()
	const [open, setOpen] = useState(false)
	const createCouponMutation = useCreateCoupon()

	const form = useForm<CreateCouponFormData>({
		resolver: zodResolver(createCouponSchema),
		defaultValues: {
			id: '',
			name: '',
			discountType: 'percent',
			amount: 1,
			duration: 'once',
			durationInMonths: undefined,
		},
	})

	const watchedDuration = form.watch('duration')
	const watchedDiscountType = form.watch('discountType')

	const onSubmit = async (data: CreateCouponFormData) => {
		try {
			await createCouponMutation.mutateAsync(data)
			form.reset()
			setOpen(false)
		} catch (error) {
			// Error is handled by the mutation
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className='gap-2'>
					<Plus className='h-4 w-4' />
					{t('coupons.addCoupon')}
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>{t('coupons.addCoupon')}</DialogTitle>
					<DialogDescription>{t('coupons.addCouponDescription')}</DialogDescription>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
					<div className='space-y-4'>
						{/* Coupon ID */}
						<div className='space-y-2'>
							<Label htmlFor='coupon-id'>{t('coupons.form.id.label')}</Label>
							<Input
								id='coupon-id'
								placeholder={t('coupons.form.id.placeholder')}
								{...form.register('id')}
							/>
							{form.formState.errors.id && (
								<p className='text-sm text-destructive'>
									{form.formState.errors.id.message}
								</p>
							)}
						</div>

						{/* Coupon Name */}
						<div className='space-y-2'>
							<Label htmlFor='coupon-name'>{t('coupons.form.name.label')}</Label>
							<Input
								id='coupon-name'
								placeholder={t('coupons.form.name.placeholder')}
								{...form.register('name')}
							/>
							{form.formState.errors.name && (
								<p className='text-sm text-destructive'>
									{form.formState.errors.name.message}
								</p>
							)}
						</div>

						{/* Discount Type */}
						<div className='space-y-2'>
							<Label htmlFor='discount-type'>
								{t('coupons.form.discountType.label')}
							</Label>
							<Select
								value={form.watch('discountType')}
								onValueChange={(value) =>
									form.setValue('discountType', value as 'percent' | 'amount')
								}>
								<SelectTrigger id='discount-type'>
									<SelectValue
										placeholder={t('coupons.form.discountType.placeholder')}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='percent'>
										{t('coupons.form.discountType.percent')}
									</SelectItem>
									<SelectItem value='amount'>
										{t('coupons.form.discountType.amount')}
									</SelectItem>
								</SelectContent>
							</Select>
							{form.formState.errors.discountType && (
								<p className='text-sm text-destructive'>
									{form.formState.errors.discountType.message}
								</p>
							)}
						</div>

						{/* Amount */}
						<div className='space-y-2'>
							<Label htmlFor='amount'>
								{watchedDiscountType === 'percent'
									? t('coupons.form.amount.labelPercent')
									: t('coupons.form.amount.labelAmount')}
							</Label>
							<Input
								id='amount'
								type='number'
								min='1'
								max={watchedDiscountType === 'percent' ? 100 : undefined}
								placeholder={
									watchedDiscountType === 'percent'
										? t('coupons.form.amount.placeholderPercent')
										: t('coupons.form.amount.placeholderAmount')
								}
								{...form.register('amount', { valueAsNumber: true })}
							/>
							{form.formState.errors.amount && (
								<p className='text-sm text-destructive'>
									{form.formState.errors.amount.message}
								</p>
							)}
						</div>

						{/* Duration */}
						<div className='space-y-2'>
							<Label htmlFor='duration'>{t('coupons.form.duration.label')}</Label>
							<Select
								value={form.watch('duration')}
								onValueChange={(value) =>
									value &&
									form.setValue(
										'duration',
										value as 'once' | 'repeating' | 'forever',
									)
								}>
								<SelectTrigger id='duration'>
									<SelectValue
										placeholder={t('coupons.form.duration.placeholder')}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='once'>
										{t('coupons.form.duration.once')}
									</SelectItem>
									<SelectItem value='repeating'>
										{t('coupons.form.duration.repeating')}
									</SelectItem>
									<SelectItem value='forever'>
										{t('coupons.form.duration.forever')}
									</SelectItem>
								</SelectContent>
							</Select>
							{form.formState.errors.duration && (
								<p className='text-sm text-destructive'>
									{form.formState.errors.duration.message}
								</p>
							)}
						</div>

						{/* Duration in Months (conditional) */}
						{watchedDuration === 'repeating' && (
							<div className='space-y-2'>
								<Label htmlFor='duration-months'>
									{t('coupons.form.durationInMonths.label')}
								</Label>
								<Input
									id='duration-months'
									type='number'
									min='1'
									max='12'
									placeholder={t('coupons.form.durationInMonths.placeholder')}
									{...form.register('durationInMonths', { valueAsNumber: true })}
								/>
								{form.formState.errors.durationInMonths && (
									<p className='text-sm text-destructive'>
										{form.formState.errors.durationInMonths.message}
									</p>
								)}
							</div>
						)}
					</div>

					{/* <DialogFooter> */}
					<div className='flex justify-end gap-2'>
						<Button type='button' variant='outline' onClick={() => setOpen(false)}>
							{t('common.cancel')}
						</Button>
						<Button type='submit' disabled={createCouponMutation.isPending}>
							{createCouponMutation.isPending
								? t('common.creating')
								: t('common.create')}
						</Button>
					</div>
					{/* </DialogFooter> */}
				</form>
			</DialogContent>
		</Dialog>
	)
}

// Promotion Codes Filter Bar Component
function PromotionCodesFilterBar({
	filters,
	onFiltersChange,
	onClearFilters,
}: {
	filters: PromotionCodeFilters
	onFiltersChange: (filters: PromotionCodeFilters) => void
	onClearFilters: () => void
}) {
	const t = useTranslations()
	const [localFilters, setLocalFilters] = useState<PromotionCodeFilters>(filters)

	const handleFilterChange = useCallback(
		(key: keyof PromotionCodeFilters, value: any) => {
			const newFilters = { ...localFilters, [key]: value }
			setLocalFilters(newFilters)
			onFiltersChange(newFilters)
		},
		[localFilters, onFiltersChange],
	)

	const handleCreatedDateChange = useCallback(
		(type: 'gt' | 'gte' | 'lt' | 'lte', value: string) => {
			const timestamp = value ? new Date(value).getTime() / 1000 : undefined
			const newCreated = { ...localFilters.created, [type]: timestamp }

			// Remove undefined values
			Object.keys(newCreated).forEach((key) => {
				if (newCreated[key as keyof typeof newCreated] === undefined) {
					delete newCreated[key as keyof typeof newCreated]
				}
			})

			const newFilters = {
				...localFilters,
				created: Object.keys(newCreated).length > 0 ? newCreated : undefined,
			}
			setLocalFilters(newFilters)
			onFiltersChange(newFilters)
		},
		[localFilters, onFiltersChange],
	)

	const hasActiveFilters = Object.keys(filters).some((key) => {
		const value = filters[key as keyof PromotionCodeFilters]
		return value !== undefined && value !== null && value !== ''
	})

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Filter className='h-4 w-4' />
						<CardTitle className='text-lg'>
							{t('promotionCodes.filters.title')}
						</CardTitle>
					</div>
					{hasActiveFilters && (
						<Button
							variant='ghost'
							size='sm'
							onClick={onClearFilters}
							className='gap-2'>
							<X className='h-4 w-4' />
							{t('common.clear')}
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
					{/* Active Status Filter */}
					<div className='space-y-2'>
						<Label htmlFor='active-filter'>
							{t('promotionCodes.filters.status.label')}
						</Label>
						<Select
							value={localFilters.active?.toString() || 'all'}
							onValueChange={(value) =>
								handleFilterChange(
									'active',
									value === 'all' ? undefined : value === 'true',
								)
							}>
							<SelectTrigger id='active-filter'>
								<SelectValue
									placeholder={t('promotionCodes.filters.status.placeholder')}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>
									{t('promotionCodes.filters.status.all')}
								</SelectItem>
								<SelectItem value='true'>
									{t('promotionCodes.status.active')}
								</SelectItem>
								<SelectItem value='false'>
									{t('promotionCodes.status.inactive')}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Code Filter */}
					<div className='space-y-2'>
						<Label htmlFor='code-filter'>
							{t('promotionCodes.filters.code.label')}
						</Label>
						<Input
							id='code-filter'
							placeholder={t('promotionCodes.filters.code.placeholder')}
							value={localFilters.code || ''}
							onChange={(e) =>
								handleFilterChange('code', e.target.value || undefined)
							}
						/>
					</div>

					{/* Coupon Filter */}
					<div className='space-y-2'>
						<Label htmlFor='coupon-filter'>
							{t('promotionCodes.filters.coupon.label')}
						</Label>
						<Input
							id='coupon-filter'
							placeholder={t('promotionCodes.filters.coupon.placeholder')}
							value={localFilters.coupon || ''}
							onChange={(e) =>
								handleFilterChange('coupon', e.target.value || undefined)
							}
						/>
					</div>

					{/* Created After Filter */}
					<div className='space-y-2'>
						<Label htmlFor='created-after'>
							{t('promotionCodes.filters.createdAfter.label')}
						</Label>
						<Input
							id='created-after'
							type='date'
							value={
								localFilters.created?.gte
									? new Date(localFilters.created.gte * 1000)
											.toISOString()
											.split('T')[0]
									: ''
							}
							onChange={(e) => handleCreatedDateChange('gte', e.target.value)}
						/>
					</div>

					{/* Created Before Filter */}
					<div className='space-y-2'>
						<Label htmlFor='created-before'>
							{t('promotionCodes.filters.createdBefore.label')}
						</Label>
						<Input
							id='created-before'
							type='date'
							value={
								localFilters.created?.lte
									? new Date(localFilters.created.lte * 1000)
											.toISOString()
											.split('T')[0]
									: ''
							}
							onChange={(e) => handleCreatedDateChange('lte', e.target.value)}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

// Coupons Filter Bar Component
function CouponsFilterBar({
	filters,
	onFiltersChange,
	onClearFilters,
}: {
	filters: CouponFilters
	onFiltersChange: (filters: CouponFilters) => void
	onClearFilters: () => void
}) {
	const t = useTranslations()
	const [localFilters, setLocalFilters] = useState<CouponFilters>(filters)

	const handleCreatedDateChange = useCallback(
		(type: 'gt' | 'gte' | 'lt' | 'lte', value: string) => {
			const timestamp = value ? new Date(value).getTime() / 1000 : undefined
			const newCreated = { ...localFilters.created, [type]: timestamp }

			// Remove undefined values
			Object.keys(newCreated).forEach((key) => {
				if (newCreated[key as keyof typeof newCreated] === undefined) {
					delete newCreated[key as keyof typeof newCreated]
				}
			})

			const newFilters = {
				...localFilters,
				created: Object.keys(newCreated).length > 0 ? newCreated : undefined,
			}
			setLocalFilters(newFilters)
			onFiltersChange(newFilters)
		},
		[localFilters, onFiltersChange],
	)

	const hasActiveFilters =
		filters.created &&
		Object.keys(filters.created).some((key) => {
			const value = filters.created![key as keyof typeof filters.created]
			return value !== undefined && value !== null
		})

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Filter className='h-4 w-4' />
						<CardTitle className='text-lg'>{t('coupons.filters.title')}</CardTitle>
					</div>
					{hasActiveFilters && (
						<Button
							variant='ghost'
							size='sm'
							onClick={onClearFilters}
							className='gap-2'>
							<X className='h-4 w-4' />
							{t('common.clear')}
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
					{/* Created After Filter */}
					<div className='space-y-2'>
						<Label htmlFor='coupon-created-after'>
							{t('coupons.filters.createdAfter.label')}
						</Label>
						<Input
							id='coupon-created-after'
							type='date'
							value={
								localFilters.created?.gte
									? new Date(localFilters.created.gte * 1000)
											.toISOString()
											.split('T')[0]
									: ''
							}
							onChange={(e) => handleCreatedDateChange('gte', e.target.value)}
						/>
					</div>

					{/* Created Before Filter */}
					<div className='space-y-2'>
						<Label htmlFor='coupon-created-before'>
							{t('coupons.filters.createdBefore.label')}
						</Label>
						<Input
							id='coupon-created-before'
							type='date'
							value={
								localFilters.created?.lte
									? new Date(localFilters.created.lte * 1000)
											.toISOString()
											.split('T')[0]
									: ''
							}
							onChange={(e) => handleCreatedDateChange('lte', e.target.value)}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

// Promotion Codes Table Component
function PromotionCodesTable({ filters }: { filters: PromotionCodeFilters }) {
	const t = useTranslations()
	const locale = useLocale()
	const { toast } = useToast()

	const { data: promotionCodesData, isLoading, error } = usePromotionCodes(filters)

	// Status badge component for promotion codes
	const StatusBadge = ({ status, t }: { status: PromotionCode['status']; t: any }) => {
		if (status.expired) {
			return <Badge variant='destructive'>{t('promotionCodes.status.expired')}</Badge>
		}
		if (status.exhausted) {
			return <Badge variant='secondary'>{t('promotionCodes.status.exhausted')}</Badge>
		}
		if (status.usable) {
			return <Badge variant='default'>{t('promotionCodes.status.active')}</Badge>
		}
		return <Badge variant='outline'>{t('promotionCodes.status.inactive')}</Badge>
	}

	async function onCopyCode(code: string) {
		const success = await copyTextToClipboard(code)
		if (success) {
			toast({
				title: t('common.success'),
				description: t('common.copiedSuccessfully'),
				variant: 'default',
			})
		} else {
			toast({
				title: t('common.error'),
				description: t('common.copiedFailed'),
				variant: 'destructive',
			})
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('promotionCodes.title')}</CardTitle>
				<CardDescription>
					{promotionCodesData?.data && (
						<span>
							{t('promotionCodes.summary', {
								total: promotionCodesData.data.length,
								active: promotionCodesData.data.filter((code) => code.status.usable)
									.length,
								expired: promotionCodesData.data.filter(
									(code) => code.status.expired,
								).length,
							})}
						</span>
					)}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('promotionCodes.table.code')}</TableHead>
							<TableHead>{t('promotionCodes.table.coupon')}</TableHead>
							<TableHead>{t('promotionCodes.table.discount')}</TableHead>
							<TableHead>{t('promotionCodes.table.usage')}</TableHead>
							<TableHead>{t('promotionCodes.table.status')}</TableHead>
							<TableHead>{t('promotionCodes.table.created')}</TableHead>
							<TableHead>{t('promotionCodes.table.expires')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={7} className='py-8 text-center'>
									{t('common.loading')}
								</TableCell>
							</TableRow>
						) : error ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className='py-8 text-center text-destructive'>
									{t('common.error')}: {error.message}
								</TableCell>
							</TableRow>
						) : !promotionCodesData?.data?.length ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className='py-8 text-center text-muted-foreground'>
									{t('promotionCodes.noPromotionCodes')}
								</TableCell>
							</TableRow>
						) : (
							promotionCodesData.data.map((code) => (
								<TableRow key={code.id}>
									<TableCell>
										<div>
											<div
												className='flex cursor-pointer items-center gap-2 font-medium'
												onClick={() => onCopyCode(code.code)}>
												{code.code} <Copy className='size-4' />
											</div>
											<div className='text-sm text-muted-foreground'>
												ID: {code.id}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div>
											<div className='font-medium'>ID: {code.coupon.id}</div>
											<div className='text-sm text-muted-foreground'>
												{code.coupon.name}
											</div>
											<div className='text-sm text-muted-foreground'>
												{code.coupon.duration}
											</div>
										</div>
									</TableCell>
									<TableCell>
										{code.coupon.percentOff
											? `${code.coupon.percentOff}%`
											: `$${(code.coupon.amountOff || 0) / 100}`}
									</TableCell>
									<TableCell>
										<div>
											<div className='font-medium'>
												{code.timesRedeemed} / {code.maxRedemptions || '∞'}
											</div>
											<div className='text-sm text-muted-foreground'>
												{t('promotionCodes.table.redeemed')}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<StatusBadge status={code.status} t={t} />
									</TableCell>
									<TableCell>{formatDate(code.created, locale)}</TableCell>
									<TableCell>
										{code.expiresAt
											? formatDate(code.expiresAt, locale)
											: t('promotionCodes.table.noExpiry')}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}

// Coupons Table Component
function CouponsTable({ filters }: { filters: CouponFilters }) {
	const t = useTranslations()
	const locale = useLocale()
	const { toast } = useToast()

	const { data: couponsData, isLoading, error } = useCoupons(filters)

	// Status badge component for coupons
	const CouponStatusBadge = ({ valid, t }: { valid: boolean; t: any }) => {
		return valid ? (
			<Badge variant='default'>{t('promotionCodes.status.active')}</Badge>
		) : (
			<Badge variant='destructive'>{t('promotionCodes.status.inactive')}</Badge>
		)
	}

	async function onCopyCode(code: string) {
		const success = await copyTextToClipboard(code)
		if (success) {
			toast({
				title: t('common.success'),
				description: t('common.copiedSuccessfully'),
				variant: 'default',
			})
		} else {
			toast({
				title: t('common.error'),
				description: t('common.copiedFailed'),
				variant: 'destructive',
			})
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle>{t('coupons.title')}</CardTitle>
						<CardDescription>
							{couponsData?.data && (
								<span>
									{t('coupons.summary', {
										total: couponsData.data.length,
										active: couponsData.data.filter((coupon) => coupon.valid)
											.length,
										inactive: couponsData.data.filter((coupon) => !coupon.valid)
											.length,
									})}
								</span>
							)}
						</CardDescription>
					</div>
					<AddCouponModal />
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('coupons.table.id')}</TableHead>
							<TableHead>{t('coupons.table.name')}</TableHead>
							<TableHead>{t('coupons.table.discount')}</TableHead>
							<TableHead>{t('coupons.table.duration')}</TableHead>
							<TableHead>{t('coupons.table.usage')}</TableHead>
							<TableHead>{t('coupons.table.status')}</TableHead>
							<TableHead>{t('coupons.table.created')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={7} className='py-8 text-center'>
									{t('common.loading')}
								</TableCell>
							</TableRow>
						) : error ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className='py-8 text-center text-destructive'>
									{t('common.error')}: {error.message}
								</TableCell>
							</TableRow>
						) : !couponsData?.data?.length ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className='py-8 text-center text-muted-foreground'>
									{t('coupons.noCoupons')}
								</TableCell>
							</TableRow>
						) : (
							couponsData.data.map((coupon) => (
								<TableRow key={coupon.id}>
									<TableCell>
										<div
											className='flex cursor-pointer items-center gap-2 font-medium'
											onClick={() => onCopyCode(coupon.id)}>
											{coupon.id} <Copy className='size-4' />
										</div>
									</TableCell>
									<TableCell>
										<div className='font-medium'>{coupon.name}</div>
									</TableCell>
									<TableCell>
										{coupon.percentOff
											? `${coupon.percentOff}%`
											: `$${(coupon.amountOff || 0) / 100}`}
									</TableCell>
									<TableCell>
										<div>
											<div className='font-medium capitalize'>
												{coupon.duration}
											</div>
											{coupon.durationInMonths && (
												<div className='text-sm text-muted-foreground'>
													{coupon.durationInMonths} months
												</div>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div>
											<div className='font-medium'>
												{coupon.timesRedeemed}
											</div>
											<div className='text-sm text-muted-foreground'>
												{t('coupons.table.redeemed')}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<CouponStatusBadge valid={coupon.valid} t={t} />
									</TableCell>
									<TableCell>{formatDate(coupon.created, locale)}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}

// Main Page Component
export default function PromotionCodesPage() {
	const t = useTranslations()
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()

	// Initialize promotion code filters from URL params
	const [promotionCodeFilters, setPromotionCodeFilters] = useState<PromotionCodeFilters>(() => {
		const initialFilters: PromotionCodeFilters = {}

		const active = searchParams.get('active')
		if (active !== null) {
			initialFilters.active = active === 'true'
		}

		const code = searchParams.get('code')
		if (code) {
			initialFilters.code = code
		}

		const coupon = searchParams.get('coupon')
		if (coupon) {
			initialFilters.coupon = coupon
		}

		// Handle created date filters for promotion codes
		const createdGte = searchParams.get('pc_created[gte]') // prefix for promotion codes
		const createdLte = searchParams.get('pc_created[lte]')
		if (createdGte || createdLte) {
			initialFilters.created = {}
			if (createdGte) initialFilters.created.gte = parseInt(createdGte)
			if (createdLte) initialFilters.created.lte = parseInt(createdLte)
		}

		return initialFilters
	})

	// Initialize coupon filters from URL params
	const [couponFilters, setCouponFilters] = useState<CouponFilters>(() => {
		const initialFilters: CouponFilters = {}

		// Handle created date filters for coupons
		const createdGte = searchParams.get('c_created[gte]') // prefix for coupons
		const createdLte = searchParams.get('c_created[lte]')
		if (createdGte || createdLte) {
			initialFilters.created = {}
			if (createdGte) initialFilters.created.gte = parseInt(createdGte)
			if (createdLte) initialFilters.created.lte = parseInt(createdLte)
		}

		return initialFilters
	})

	// Use both hooks to get loading states
	const { refetch: refetchPromotionCodes, isLoading: isLoadingPromotionCodes } =
		usePromotionCodes(promotionCodeFilters)
	const { refetch: refetchCoupons, isLoading: isLoadingCoupons } = useCoupons(couponFilters)

	// Update URL when promotion code filters change
	const handlePromotionCodeFiltersChange = useCallback(
		(newFilters: PromotionCodeFilters) => {
			setPromotionCodeFilters(newFilters)

			const params = new URLSearchParams(searchParams.toString())

			// Clear existing promotion code filter params
			params.delete('active')
			params.delete('code')
			params.delete('coupon')
			params.delete('pc_created[gte]')
			params.delete('pc_created[lte]')

			// Set new promotion code filter params
			if (newFilters.active !== undefined) {
				params.set('active', newFilters.active.toString())
			}
			if (newFilters.code) {
				params.set('code', newFilters.code)
			}
			if (newFilters.coupon) {
				params.set('coupon', newFilters.coupon)
			}
			if (newFilters.created?.gte) {
				params.set('pc_created[gte]', newFilters.created.gte.toString())
			}
			if (newFilters.created?.lte) {
				params.set('pc_created[lte]', newFilters.created.lte.toString())
			}

			const queryString = params.toString()
			router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
		},
		[router, pathname, searchParams],
	)

	// Update URL when coupon filters change
	const handleCouponFiltersChange = useCallback(
		(newFilters: CouponFilters) => {
			setCouponFilters(newFilters)

			const params = new URLSearchParams(searchParams.toString())

			// Clear existing coupon filter params
			params.delete('c_created[gte]')
			params.delete('c_created[lte]')

			// Set new coupon filter params
			if (newFilters.created?.gte) {
				params.set('c_created[gte]', newFilters.created.gte.toString())
			}
			if (newFilters.created?.lte) {
				params.set('c_created[lte]', newFilters.created.lte.toString())
			}

			const queryString = params.toString()
			router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
		},
		[router, pathname, searchParams],
	)

	// Clear promotion code filters
	const handleClearPromotionCodeFilters = useCallback(() => {
		setPromotionCodeFilters({})
		const params = new URLSearchParams(searchParams.toString())
		params.delete('active')
		params.delete('code')
		params.delete('coupon')
		params.delete('pc_created[gte]')
		params.delete('pc_created[lte]')

		const queryString = params.toString()
		router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
	}, [router, pathname, searchParams])

	// Clear coupon filters
	const handleClearCouponFilters = useCallback(() => {
		setCouponFilters({})
		const params = new URLSearchParams(searchParams.toString())
		params.delete('c_created[gte]')
		params.delete('c_created[lte]')

		const queryString = params.toString()
		router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
	}, [router, pathname, searchParams])

	// Refresh all tables
	const handleRefreshAll = () => {
		refetchPromotionCodes()
		refetchCoupons()
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div>
				<h1 className='text-3xl font-bold tracking-tight'>{t('promotionCodes.title')}</h1>
				<p className='text-muted-foreground'>{t('promotionCodes.description')}</p>
			</div>

			{/* Actions */}
			<div className='flex justify-end'>
				<Button
					variant='outline'
					onClick={handleRefreshAll}
					disabled={isLoadingPromotionCodes || isLoadingCoupons}
					className='gap-2'>
					<RefreshCw
						className={`h-4 w-4 ${isLoadingPromotionCodes || isLoadingCoupons ? 'animate-spin' : ''}`}
					/>
					{t('common.refresh')}
				</Button>
			</div>

			{/* Promotion Codes Filter Bar */}
			<PromotionCodesFilterBar
				filters={promotionCodeFilters}
				onFiltersChange={handlePromotionCodeFiltersChange}
				onClearFilters={handleClearPromotionCodeFilters}
			/>

			{/* Promotion Codes Table */}
			<PromotionCodesTable filters={promotionCodeFilters} />

			{/* Coupons Filter Bar */}
			<CouponsFilterBar
				filters={couponFilters}
				onFiltersChange={handleCouponFiltersChange}
				onClearFilters={handleClearCouponFilters}
			/>

			{/* Coupons Table */}
			<CouponsTable filters={couponFilters} />
		</div>
	)
}
