'use client'

import { Locale, useLocale, useTranslations } from 'next-intl'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'
import { useQuery } from '@tanstack/react-query'
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
import { Copy, RefreshCw } from 'lucide-react'

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

type ApiResponse<T> = {
	status: string
	statusCode: number
	message: string
	data: T
}

// Custom hook for fetching promotion codes
const usePromotionCodes = () => {
	return useQuery<ApiResponse<PromotionCode[]>>({
		queryKey: ['promotion-codes'],
		queryFn: async () => {
			const response = await fetchWithNgrok('/stripe/promotion-codes')
			if (!response.ok) {
				throw new Error('Failed to fetch promotion codes')
			}
			return response.json()
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

export default function PromotionCodesPage() {
	const t = useTranslations()
	const locale = useLocale()

	// Use custom hook for fetching promotion codes
	const { data: promotionCodesData, isLoading, error, refetch } = usePromotionCodes()

	// Status badge component
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
					onClick={() => refetch()}
					disabled={isLoading}
					className='gap-2'>
					<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
					{t('common.refresh')}
				</Button>
			</div>

			{/* Table Card */}
			<Card>
				<CardHeader>
					<CardTitle>{t('promotionCodes.title')}</CardTitle>
					<CardDescription>
						{promotionCodesData?.data && (
							<span>
								{t('promotionCodes.summary', {
									total: promotionCodesData.data.length,
									active: promotionCodesData.data.filter(
										(code) => code.status.usable,
									).length,
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
													onClick={() => copyTextToClipboard(code.code)}>
													{code.code} <Copy className='size-4' />
												</div>
												<div className='text-sm text-muted-foreground'>
													ID: {code.id}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div>
												<div className='font-medium'>
													ID: {code.coupon.id}
												</div>
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
													{code.timesRedeemed} /{' '}
													{code.maxRedemptions || '∞'}
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
		</div>
	)
}
