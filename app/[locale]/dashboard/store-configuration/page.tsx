'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'
import { imageUrl } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Loader2, ExternalLink, Image as ImageIcon, Edit, Check, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'

interface StoreConfig {
	id: number
	auctionCommissionPercentage: number
	deliveryFee: number
	banners: [string, string][] // Array of [imageUrl, linkUrl] tuples
	createdAt: string
	updatedAt: string
}

interface StoreConfigResponse {
	statusCode: number
	status: string
	message: string
	data: StoreConfig
}

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

	return useMutation({
		mutationFn: async (data: {
			auctionCommissionPercentage?: number
			deliveryFee?: number
		}) => {
			const formData = new FormData()

			if (data.auctionCommissionPercentage !== undefined) {
				formData.append(
					'auctionCommissionPercentage',
					data.auctionCommissionPercentage.toString(),
				)
			}
			if (data.deliveryFee !== undefined) {
				formData.append('deliveryFee', data.deliveryFee.toString())
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
				title: 'Success',
				description: 'Store configuration updated successfully',
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

export default function StoreConfigPage() {
	const t = useTranslations()
	const { data, isLoading, isError, error } = useStoreConfig()
	const updateStoreConfigMutation = useUpdateStoreConfig()

	const handleUpdateAuctionCommission = (value: number) => {
		updateStoreConfigMutation.mutate({ auctionCommissionPercentage: value })
	}

	const handleUpdateDeliveryFee = (value: number) => {
		updateStoreConfigMutation.mutate({ deliveryFee: value })
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
			</div>

			{/* Banners Section */}
			{storeConfig.banners.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>{t('storeConfiguration.banners')}</CardTitle>
						<CardDescription>
							{t('storeConfiguration.bannersDescription')}
						</CardDescription>
					</CardHeader>
					<CardContent>
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
								{storeConfig.banners.map((banner, index) => {
									const [url, linkUrl] = banner
									return (
										<TableRow key={index}>
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
											</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
