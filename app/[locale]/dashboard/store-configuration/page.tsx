'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'
import { imageUrl } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

// Banner Component
function BannerCard({ banner, index }: { banner: [string, string]; index: number }) {
	const t = useTranslations()
	const [imageError, setImageError] = useState(false)
	const [url, linkUrl] = banner

	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-lg'>
					{t('storeConfiguration.banner')} #{index + 1}
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* Banner Image */}
				<div className='aspect-video w-full overflow-hidden rounded-lg border bg-muted'>
					{!imageError ? (
						<img
							src={imageUrl(url)}
							alt={`Banner ${index + 1}`}
							className='h-full w-full object-cover'
							onError={() => setImageError(true)}
						/>
					) : (
						<div className='flex h-full w-full items-center justify-center'>
							<div className='text-center'>
								<ImageIcon className='mx-auto h-12 w-12 text-muted-foreground' />
								<p className='mt-2 text-sm text-muted-foreground'>
									{t('storeConfiguration.imageLoadError')}
								</p>
							</div>
						</div>
					)}
				</div>

				{/* Banner Details */}
				<div className='space-y-2'>
					<div>
						<label className='text-sm font-medium text-muted-foreground'>
							{t('storeConfiguration.linkUrl')}
						</label>
						<div className='flex items-center gap-2'>
							<p className='break-all text-sm'>{linkUrl}</p>
							{linkUrl && (
								<a
									href={linkUrl}
									target='_blank'
									rel='noopener noreferrer'
									className='text-primary hover:text-primary/80'>
									<ExternalLink className='h-4 w-4' />
								</a>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default function StoreConfigPage() {
	const t = useTranslations()
	const { data, isLoading, isError, error } = useStoreConfig()

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
						<div className='text-2xl font-bold text-primary'>
							{formatPercentage(storeConfig.auctionCommissionPercentage)}
						</div>
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
						<div className='text-2xl font-bold text-primary'>
							{formatCurrency(storeConfig.deliveryFee)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Banners Section */}
			{storeConfig.banners.length > 0 && (
				<div className='space-y-4'>
					<h2 className='text-2xl font-semibold tracking-tight'>
						{t('storeConfiguration.banners')}
					</h2>
					<div className='grid gap-6 md:grid-cols-2'>
						{storeConfig.banners.map((banner, index) => (
							<BannerCard key={index} banner={banner} index={index} />
						))}
					</div>
				</div>
			)}
		</div>
	)
}
