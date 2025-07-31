'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'
import { imageUrl } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Loader2,
	ExternalLink,
	Image as ImageIcon,
	Edit,
	Check,
	X,
	Plus,
	Trash2,
	ChevronUp,
	ChevronDown,
	Monitor,
	Smartphone,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import React from 'react'
import { Entries } from 'type-fest'

interface StoreConfig {
	id: number
	auctionCommissionPercentage: number
	deliveryFee: number
	minimumWithdrawalAmount: number
	maximumWithdrawalAmount: number
	banners: [string, string][] // Array of [imageUrl, linkUrl] tuples
	mobileBanners: [string, string][] // Array of [imageUrl, linkUrl] tuples
	createdAt: string
	updatedAt: string
}

interface StoreConfigResponse {
	statusCode: number
	status: string
	message: string
	data: StoreConfig
}

type BannerType = 'banners' | 'mobileBanners'

type UpdateConfigData = Partial<StoreConfig> & { images?: File[] }

// Query hook
const useStoreConfig = () => {
	return useQuery<StoreConfigResponse>({
		queryKey: ['store-config'],
		queryFn: async () => {
			const response = await fetchWithNgrok('/store-config', {
				method: 'GET',
			})

			if (!response.ok) {
				throw new Error(`Failed to fetch store config: ${response.status}`)
			}

			return response.json()
		},
	})
}

// Update store config mutation
const useUpdateStoreConfig = () => {
	const queryClient = useQueryClient()
	const { toast } = useToast()
	const t = useTranslations()

	return useMutation({
		mutationFn: async (data: UpdateConfigData) => {
			const formData = new FormData()

			const dataArr = Object.entries(data) as Entries<UpdateConfigData>

			for (const [key, value] of dataArr) {
				if ((key === 'banners' || key === 'mobileBanners') && Array.isArray(value)) {
					formData.append(key, JSON.stringify(value))
				}
				if (key === 'images' && Array.isArray(value)) {
					;(value as File[]).forEach((image, index) => {
						formData.append(key, image)
					})
				} else if (value !== undefined) {
					formData.append(key, value.toString())
				}
			}

			const response = await fetchWithNgrok('/store-config', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'remove',
				},
				body: formData,
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Failed to update store config')
			}

			return response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['store-config'] })
			toast({
				title: t('common.success'),
				description: t('storeConfiguration.updateSuccess'),
				variant: 'default',
			})
		},
		onError: (error: Error) => {
			toast({
				title: t('common.error'),
				description: error.message,
				variant: 'destructive',
			})
		},
	})
}

// Utility functions
const formatCurrency = (amount: number) => {
	return `$${amount.toFixed(2)}`
}

const formatPercentage = (percentage: number) => {
	return `${percentage}%`
}

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleString()
}

// Add Banner Modal Component
function AddBannerModal({
	existingBanners,
	bannerType,
}: {
	existingBanners: [string, string][]
	bannerType: BannerType
}) {
	const t = useTranslations()
	const [open, setOpen] = useState(false)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [linkUrl, setLinkUrl] = useState('')
	const updateStoreConfigMutation = useUpdateStoreConfig()

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setSelectedFile(file)
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!selectedFile) {
			return
		}

		// Create new banner entry: ['', linkUrl, fileSize]
		const newBannerEntry: [string, string, string] = ['', linkUrl, selectedFile.size.toString()]
		const updatedBanners = [...existingBanners, newBannerEntry]

		const updateData = {
			[bannerType]: updatedBanners,
			images: [selectedFile],
		}

		updateStoreConfigMutation.mutate(updateData as any)

		// Reset form
		setSelectedFile(null)
		setLinkUrl('')
		setOpen(false)
	}

	const getBannerTypeLabel = () => {
		return bannerType === 'banners'
			? t('storeConfiguration.desktopBanner')
			: t('storeConfiguration.mobileBanner')
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className='gap-2'>
					<Plus className='h-4 w-4' />
					{t('storeConfiguration.addBanner')}
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>
						{t('storeConfiguration.addBanner')} - {getBannerTypeLabel()}
					</DialogTitle>
					<DialogDescription>
						{t('storeConfiguration.addBannerDescription')}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-4'>
						{/* File Input */}
						<div className='space-y-2'>
							<Label htmlFor='banner-image'>
								{t('storeConfiguration.form.image.label')}
							</Label>
							<Input
								id='banner-image'
								type='file'
								accept='image/*'
								onChange={handleFileChange}
								required
							/>
							{selectedFile && (
								<p className='text-sm text-muted-foreground'>
									{t('storeConfiguration.form.image.selected')}:{' '}
									{selectedFile.name}
								</p>
							)}
						</div>

						{/* Link URL Input */}
						<div className='space-y-2'>
							<Label htmlFor='banner-link'>
								{t('storeConfiguration.form.linkUrl.label')}
							</Label>
							<Input
								id='banner-link'
								type='url'
								placeholder={t('storeConfiguration.form.linkUrl.placeholder')}
								value={linkUrl}
								onChange={(e) => setLinkUrl(e.target.value)}
								required
							/>
						</div>
					</div>

					<div className='flex justify-end gap-2'>
						<Button type='button' variant='outline' onClick={() => setOpen(false)}>
							{t('common.cancel')}
						</Button>
						<Button
							type='submit'
							disabled={updateStoreConfigMutation.isPending || !selectedFile}>
							{updateStoreConfigMutation.isPending
								? t('common.creating')
								: t('storeConfiguration.addBanner')}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

// Editable Field Component
function EditableField({
	value,
	type,
	fieldName,
	formatDisplay,
	onUpdate,
	isLoading,
}: {
	value: number
	type: 'percentage' | 'currency'
	fieldName: string
	formatDisplay: (val: number) => string
	onUpdate: (value: number) => void
	isLoading: boolean
}) {
	const t = useTranslations()
	const [isEditing, setIsEditing] = useState(false)
	const [inputValue, setInputValue] = useState(value.toString())

	const handleEdit = () => {
		setIsEditing(true)
		setInputValue(value.toString())
	}

	const handleCancel = () => {
		setIsEditing(false)
		setInputValue(value.toString())
	}

	const handleUpdate = () => {
		const numericValue = parseFloat(inputValue)
		if (isNaN(numericValue) || numericValue < 0) {
			return
		}

		if (type === 'percentage' && numericValue > 100) {
			return
		}

		onUpdate(numericValue)
		setIsEditing(false)
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleUpdate()
		} else if (e.key === 'Escape') {
			handleCancel()
		}
	}

	if (isEditing) {
		return (
			<div className='flex items-center gap-2'>
				<Input
					type='number'
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyPress}
					className='h-8 w-24'
					min='0'
					max={type === 'percentage' ? 100 : undefined}
					step={type === 'percentage' ? 1 : 0.01}
					disabled={isLoading}
					autoFocus
				/>
				<Button
					size='sm'
					onClick={handleUpdate}
					disabled={isLoading}
					className='h-8 w-8 p-0'>
					<Check className='h-4 w-4' />
				</Button>
				<Button
					size='sm'
					variant='outline'
					onClick={handleCancel}
					disabled={isLoading}
					className='h-8 w-8 p-0'>
					<X className='h-4 w-4' />
				</Button>
			</div>
		)
	}

	return (
		<div className='group relative flex w-min items-center'>
			<div className='text-2xl font-bold text-primary'>{formatDisplay(value)}</div>
			<Button
				size='sm'
				variant='ghost'
				onClick={handleEdit}
				className='h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100'>
				<Edit className='h-3 w-3' />
			</Button>
		</div>
	)
}

// Banner Image Component
function BannerImage({ url, index }: { url: string; index: number }) {
	const t = useTranslations()
	const [imageError, setImageError] = useState(false)

	return (
		<div className='h-20 w-32 overflow-hidden rounded-lg border bg-muted'>
			{!imageError ? (
				<img
					src={imageUrl(url)}
					alt={`Banner ${index + 1}`}
					className='h-full w-full object-cover'
					onError={() => setImageError(true)}
				/>
			) : (
				<div className='flex h-full w-full items-center justify-center'>
					<ImageIcon className='h-6 w-6 text-muted-foreground' />
				</div>
			)}
		</div>
	)
}

// Banner Management Component (Modularized)
function BannerManagement({
	banners,
	bannerType,
	pendingChanges,
	setPendingChanges,
	onRemove,
	onMove,
	onUpdate,
	onCancel,
	isLoading,
}: {
	banners: [string, string][]
	bannerType: BannerType
	pendingChanges: [string, string][] | null
	setPendingChanges: (banners: [string, string][] | null) => void
	onRemove: (index: number) => void
	onMove: (index: number, direction: 'up' | 'down') => void
	onUpdate: () => void
	onCancel: () => void
	isLoading: boolean
}) {
	const t = useTranslations()
	const displayBanners = pendingChanges || banners

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<div className='space-y-1'>
					<h3 className='text-lg font-semibold'>
						{bannerType === 'banners'
							? t('storeConfiguration.desktopBanners')
							: t('storeConfiguration.mobileBanners')}
					</h3>
					<p className='text-sm text-muted-foreground'>
						{bannerType === 'banners'
							? t('storeConfiguration.desktopBannersDescription')
							: t('storeConfiguration.mobileBannersDescription')}
					</p>
				</div>
				<AddBannerModal existingBanners={displayBanners} bannerType={bannerType} />
			</div>

			{displayBanners.length > 0 ? (
				<>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('storeConfiguration.table.banner')}</TableHead>
								<TableHead>{t('storeConfiguration.table.image')}</TableHead>
								<TableHead>{t('storeConfiguration.table.linkUrl')}</TableHead>
								<TableHead>{t('storeConfiguration.table.actions')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{displayBanners.map((banner, index) => {
								const [url, linkUrl] = banner
								return (
									<TableRow key={index} className='group'>
										<TableCell>
											<div className='font-medium'>
												{t('storeConfiguration.banner')} #{index + 1}
											</div>
										</TableCell>
										<TableCell>
											<BannerImage url={url} index={index} />
										</TableCell>
										<TableCell>
											<div className='max-w-xs'>
												<p className='break-all text-sm text-muted-foreground'>
													{linkUrl}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-1'>
												{linkUrl && (
													<a
														href={linkUrl}
														target='_blank'
														rel='noopener noreferrer'
														className='inline-flex items-center gap-1 text-primary hover:text-primary/80'>
														<ExternalLink className='h-4 w-4' />
														{t('storeConfiguration.table.visit')}
													</a>
												)}

												{/* Reorder Controls */}
												<div className='ml-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
													<Button
														size='sm'
														variant='ghost'
														onClick={() => onMove(index, 'up')}
														disabled={index === 0 || isLoading}
														className='h-6 w-6 p-0'>
														<ChevronUp className='h-3 w-3' />
													</Button>
													<Button
														size='sm'
														variant='ghost'
														onClick={() => onMove(index, 'down')}
														disabled={
															index === displayBanners.length - 1 ||
															isLoading
														}
														className='h-6 w-6 p-0'>
														<ChevronDown className='h-3 w-3' />
													</Button>
												</div>

												{/* Remove Banner */}
												<Button
													size='sm'
													variant='ghost'
													onClick={() => onRemove(index)}
													className='ml-1 h-6 w-6 p-0 text-destructive opacity-0 transition-opacity group-hover:opacity-100'
													disabled={isLoading}>
													<Trash2 className='h-3 w-3' />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>

					{/* Update Button - Show when there are pending changes */}
					{pendingChanges && (
						<div className='mt-4 flex justify-center gap-2'>
							<Button onClick={onUpdate} disabled={isLoading} className='gap-2'>
								{isLoading ? (
									<>
										<Loader2 className='h-4 w-4 animate-spin' />
										{t('common.updating')}
									</>
								) : (
									<>
										<Check className='h-4 w-4' />
										{t('storeConfiguration.updateBannerOrder')}
									</>
								)}
							</Button>
							<Button variant='outline' onClick={onCancel} disabled={isLoading}>
								{t('common.cancel')}
							</Button>
						</div>
					)}
				</>
			) : (
				<div className='py-8 text-center text-muted-foreground'>
					{t('storeConfiguration.noBanners')}
				</div>
			)}
		</div>
	)
}

export default function StoreConfigPage() {
	const t = useTranslations()
	const { data, isLoading, isError, error } = useStoreConfig()
	const updateStoreConfigMutation = useUpdateStoreConfig()
	const [pendingDesktopChanges, setPendingDesktopChanges] = useState<[string, string][] | null>(
		null,
	)
	const [pendingMobileChanges, setPendingMobileChanges] = useState<[string, string][] | null>(
		null,
	)
	const [activeTab, setActiveTab] = useState('desktop')

	const handleUpdateAuctionCommission = (value: number) => {
		updateStoreConfigMutation.mutate({ auctionCommissionPercentage: value })
	}

	const handleUpdateDeliveryFee = (value: number) => {
		updateStoreConfigMutation.mutate({ deliveryFee: value })
	}

	const handleUpdateMinimumWithdrawalAmount = (value: number) => {
		updateStoreConfigMutation.mutate({ minimumWithdrawalAmount: value })
	}
	const handleUpdateMaximumWithdrawalAmount = (value: number) => {
		updateStoreConfigMutation.mutate({ maximumWithdrawalAmount: value })
	}

	const handleRemoveBanner = (indexToRemove: number, bannerType: BannerType) => {
		if (!data?.data) return

		const currentBanners =
			bannerType === 'banners' ? data.data.banners : data.data.mobileBanners
		const pendingChanges =
			bannerType === 'banners' ? pendingDesktopChanges : pendingMobileChanges
		const banners = pendingChanges || currentBanners

		const updatedBanners = banners.filter((_, index) => index !== indexToRemove)

		if (bannerType === 'banners') {
			setPendingDesktopChanges(updatedBanners)
		} else {
			setPendingMobileChanges(updatedBanners)
		}
	}

	const handleMoveBanner = (
		currentIndex: number,
		direction: 'up' | 'down',
		bannerType: BannerType,
	) => {
		if (!data?.data) return

		const currentBanners =
			bannerType === 'banners' ? data.data.banners : data.data.mobileBanners
		const pendingChanges =
			bannerType === 'banners' ? pendingDesktopChanges : pendingMobileChanges
		const banners = pendingChanges || currentBanners

		const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

		if (newIndex < 0 || newIndex >= banners.length) return

		const updatedBanners = [...banners]
		// Swap positions
		;[updatedBanners[currentIndex], updatedBanners[newIndex]] = [
			updatedBanners[newIndex],
			updatedBanners[currentIndex],
		]

		if (bannerType === 'banners') {
			setPendingDesktopChanges(updatedBanners)
		} else {
			setPendingMobileChanges(updatedBanners)
		}
	}

	const handleUpdateBannerOrder = (bannerType: BannerType) => {
		const pendingChanges =
			bannerType === 'banners' ? pendingDesktopChanges : pendingMobileChanges
		if (!pendingChanges) return

		const updateData = {
			[bannerType]: pendingChanges,
		}

		updateStoreConfigMutation.mutate(updateData as any)

		// Clear pending changes
		if (bannerType === 'banners') {
			setPendingDesktopChanges(null)
		} else {
			setPendingMobileChanges(null)
		}
	}

	const handleCancelBannerChanges = (bannerType: BannerType) => {
		if (bannerType === 'banners') {
			setPendingDesktopChanges(null)
		} else {
			setPendingMobileChanges(null)
		}
	}

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>
						{t('storeConfiguration.title')}
					</h1>
					<p className='text-muted-foreground'>{t('storeConfiguration.description')}</p>
				</div>
				<div className='flex justify-center py-8'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			</div>
		)
	}

	if (isError) {
		return (
			<div className='space-y-6'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>
						{t('storeConfiguration.title')}
					</h1>
					<p className='text-muted-foreground'>{t('storeConfiguration.description')}</p>
				</div>
				<Alert variant='destructive'>
					<AlertDescription>
						{error instanceof Error ? error.message : t('storeConfiguration.loadError')}
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	const storeConfig = data?.data

	if (!storeConfig) {
		return (
			<div className='space-y-6'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>
						{t('storeConfiguration.title')}
					</h1>
					<p className='text-muted-foreground'>{t('storeConfiguration.description')}</p>
				</div>
				<Alert>
					<AlertDescription>{t('storeConfiguration.noData')}</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div>
				<h1 className='text-3xl font-bold tracking-tight'>
					{t('storeConfiguration.title')}
				</h1>
				<p className='text-muted-foreground'>{t('storeConfiguration.description')}</p>
			</div>

			{/* Configuration Settings */}
			<div className='grid gap-6 md:grid-cols-2'>
				{/* Auction Commission */}
				<Card>
					<CardHeader>
						<CardTitle>{t('storeConfiguration.auctionCommission')}</CardTitle>
						<CardDescription>
							{t('storeConfiguration.auctionCommissionDescription')}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<EditableField
							value={storeConfig.auctionCommissionPercentage}
							type='percentage'
							fieldName='auctionCommissionPercentage'
							formatDisplay={formatPercentage}
							onUpdate={handleUpdateAuctionCommission}
							isLoading={updateStoreConfigMutation.isPending}
						/>
					</CardContent>
				</Card>

				{/* Delivery Fee */}
				<Card>
					<CardHeader>
						<CardTitle>{t('storeConfiguration.deliveryFee')}</CardTitle>
						<CardDescription>
							{t('storeConfiguration.deliveryFeeDescription')}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<EditableField
							value={storeConfig.deliveryFee}
							type='currency'
							fieldName='deliveryFee'
							formatDisplay={formatCurrency}
							onUpdate={handleUpdateDeliveryFee}
							isLoading={updateStoreConfigMutation.isPending}
						/>
					</CardContent>
				</Card>

				{/* Withdrawal Amount Limits */}
				<Card>
					<CardHeader>
						<CardTitle>{t('storeConfiguration.withdrawalLimits')}</CardTitle>
						<CardDescription>
							{t('storeConfiguration.withdrawalLimitsDescription')}
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-6'>
						{/* Minimum Withdrawal */}
						<div>
							<Label className='mb-1 block text-sm font-medium'>
								{t('storeConfiguration.minimumWithdrawalAmount')}
							</Label>
							<EditableField
								value={storeConfig.minimumWithdrawalAmount}
								type='currency'
								fieldName='minimumWithdrawalAmount'
								formatDisplay={formatCurrency}
								onUpdate={handleUpdateMinimumWithdrawalAmount}
								isLoading={updateStoreConfigMutation.isPending}
							/>
						</div>
						{/* Maximum Withdrawal */}
						<div>
							<Label className='mb-1 block text-sm font-medium'>
								{t('storeConfiguration.maximumWithdrawalAmount')}
							</Label>
							<EditableField
								value={storeConfig.maximumWithdrawalAmount}
								type='currency'
								fieldName='maximumWithdrawalAmount'
								formatDisplay={formatCurrency}
								onUpdate={handleUpdateMaximumWithdrawalAmount}
								isLoading={updateStoreConfigMutation.isPending}
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Banners Section with Tabs */}
			<Card>
				<CardHeader>
					<div>
						<CardTitle>{t('storeConfiguration.banners')}</CardTitle>
						<CardDescription>
							{t('storeConfiguration.bannersDescription')}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
						<TabsList className='grid w-full grid-cols-2'>
							<TabsTrigger value='desktop' className='gap-2'>
								<Monitor className='h-4 w-4' />
								{t('storeConfiguration.desktopBanners')}
							</TabsTrigger>
							<TabsTrigger value='mobile' className='gap-2'>
								<Smartphone className='h-4 w-4' />
								{t('storeConfiguration.mobileBanners')}
							</TabsTrigger>
						</TabsList>

						<TabsContent value='desktop'>
							<BannerManagement
								banners={storeConfig.banners}
								bannerType='banners'
								pendingChanges={pendingDesktopChanges}
								setPendingChanges={setPendingDesktopChanges}
								onRemove={(index) => handleRemoveBanner(index, 'banners')}
								onMove={(index, direction) =>
									handleMoveBanner(index, direction, 'banners')
								}
								onUpdate={() => handleUpdateBannerOrder('banners')}
								onCancel={() => handleCancelBannerChanges('banners')}
								isLoading={updateStoreConfigMutation.isPending}
							/>
						</TabsContent>

						<TabsContent value='mobile'>
							<BannerManagement
								banners={storeConfig.mobileBanners}
								bannerType='mobileBanners'
								pendingChanges={pendingMobileChanges}
								setPendingChanges={setPendingMobileChanges}
								onRemove={(index) => handleRemoveBanner(index, 'mobileBanners')}
								onMove={(index, direction) =>
									handleMoveBanner(index, direction, 'mobileBanners')
								}
								onUpdate={() => handleUpdateBannerOrder('mobileBanners')}
								onCancel={() => handleCancelBannerChanges('mobileBanners')}
								isLoading={updateStoreConfigMutation.isPending}
							/>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	)
}
