'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'
import { imageUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Loader2, Image as ImageIcon, Ruler } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Types & Interfaces
interface ProductImage {
	id: number
	url: string
}

interface Seller {
	id: number
	firstName: string
	lastName: string
	username: string
	email: string
	avatarUrl: string
	isInfluencer: boolean
}

interface Bid {
	id: number
	amount: number
	userId: number
	createdAt: string
}

interface Product {
	id: number
	sellerId: number
	title: string
	description: string
	category: string
	subcategory: string
	brand: string
	brandImage: string
	size: string
	color: string
	colorCode: string
	material: string | null
	condition: string
	price: number
	isAuction: boolean
	isFeatured: boolean
	isPremium: boolean
	startDate: string | null
	endDate: string | null
	productHeight: number | null
	chestMeasurement: number | null
	waistMeasurement: number | null
	hipsMeasurement: number | null
	status: 'draft' | 'pending_approval' | 'live' | 'auction_ended' | 'sold' | 'archived'
	textSearch: string
	createdAt: string
	updatedAt: string
	images: ProductImage[]
	seller: Seller
	bids: Bid[]
}

interface ProductsResponse {
	statusCode: number
	status: string
	message: string
	data: {
		products: Product[]
		pagination: {
			total: number
			page: number
			limit: number
			nextPage: boolean
			prevPage: boolean
		}
	}
}

// Query hook
const useUserProducts = (userId: string, page: number = 1, limit: number = 10) => {
	return useQuery<ProductsResponse>({
		queryKey: ['user-products', userId, page, limit],
		queryFn: async () => {
			const params = new URLSearchParams({
				userId: userId,
				page: page.toString(),
				limit: limit.toString(),
			})

			const response = await fetchWithNgrok(`/products?${params.toString()}`, {
				method: 'GET',
			})

			if (!response.ok) {
				throw new Error(`Failed to fetch user products: ${response.status}`)
			}

			return response.json()
		},
		enabled: !isNaN(parseInt(userId, 10)),
	})
}

// Utility functions
const formatCurrency = (amount: number) => {
	return `$${amount.toFixed(2)}`
}

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString()
}

const getStatusBadgeVariant = (status: Product['status']) => {
	switch (status) {
		case 'live':
			return 'default'
		case 'sold':
			return 'secondary'
		case 'draft':
			return 'outline'
		case 'pending_approval':
			return 'secondary'
		case 'auction_ended':
			return 'outline'
		case 'archived':
			return 'destructive'
		default:
			return 'secondary'
	}
}

const getConditionLabel = (condition: string, t: any) => {
	switch (condition) {
		case 'like_new':
			return t('products.conditions.likeNew')
		case 'good':
			return t('products.conditions.good')
		case 'fair':
			return t('products.conditions.fair')
		case 'poor':
			return t('products.conditions.poor')
		default:
			return condition
	}
}

// Product Image Component
function ProductImage({ images, title }: { images: ProductImage[]; title: string }) {
	const [imageError, setImageError] = useState(false)
	const mainImage = images[0]

	return (
		<div className='h-16 w-16 overflow-hidden rounded-lg border bg-muted'>
			{!imageError && mainImage ? (
				<img
					src={imageUrl(mainImage.url)}
					alt={title}
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

// Size Modal Component
function SizeModal({ product }: { product: Product }) {
	const t = useTranslations()

	const hasMeasurements =
		product.productHeight ||
		product.chestMeasurement ||
		product.waistMeasurement ||
		product.hipsMeasurement

	if (!hasMeasurements) {
		return <span className='text-sm'>{product.size}</span>
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant='ghost' className='h-auto p-0 text-sm underline hover:no-underline'>
					{product.size}
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Ruler className='h-4 w-4' />
						{t('products.sizeMeasurements')}
					</DialogTitle>
					<DialogDescription>
						{t('products.sizeMeasurementsDescription')} - {product.title}
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='text-center'>
							<p className='text-2xl font-bold'>{product.size}</p>
							<p className='text-sm text-muted-foreground'>{t('products.size')}</p>
						</div>
						<div className='space-y-2'>
							{product.productHeight && (
								<div className='flex justify-between'>
									<span className='text-sm text-muted-foreground'>
										{t('products.height')}:
									</span>
									<span className='text-sm font-medium'>
										{product.productHeight} cm
									</span>
								</div>
							)}
							{product.chestMeasurement && (
								<div className='flex justify-between'>
									<span className='text-sm text-muted-foreground'>
										{t('products.chest')}:
									</span>
									<span className='text-sm font-medium'>
										{product.chestMeasurement} cm
									</span>
								</div>
							)}
							{product.waistMeasurement && (
								<div className='flex justify-between'>
									<span className='text-sm text-muted-foreground'>
										{t('products.waist')}:
									</span>
									<span className='text-sm font-medium'>
										{product.waistMeasurement} cm
									</span>
								</div>
							)}
							{product.hipsMeasurement && (
								<div className='flex justify-between'>
									<span className='text-sm text-muted-foreground'>
										{t('products.hips')}:
									</span>
									<span className='text-sm font-medium'>
										{product.hipsMeasurement} cm
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

// Price Display Component
function PriceDisplay({ product, t }: { product: Product; t: any }) {
	if (!product.isAuction) {
		return <span className='font-medium'>{formatCurrency(product.price)}</span>
	}

	const highestBid = product.bids.length > 0 ? product.bids[0] : null

	return (
		<div className='space-y-1'>
			<div>
				<span className='text-xs text-muted-foreground'>{t('products.basePrice')}:</span>
				<div className='font-medium'>{formatCurrency(product.price)}</div>
			</div>
			{highestBid && (
				<div>
					<span className='text-xs text-muted-foreground'>
						{t('products.highestBid')}:
					</span>
					<div className='font-medium text-green-600'>
						{formatCurrency(highestBid.amount)}
					</div>
				</div>
			)}
		</div>
	)
}

export default function UsersProductsTable({ userId }: { userId: string }) {
	const t = useTranslations()
	const [currentPage, setCurrentPage] = useState(1)
	const limit = 10

	const { data, isLoading, isError, error } = useUserProducts(userId, currentPage, limit)

	if (isLoading) {
		return (
			<div className='flex justify-center py-8'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		)
	}

	if (isError) {
		return (
			<Alert variant='destructive'>
				<AlertDescription>
					{error instanceof Error ? error.message : t('products.loadError')}
				</AlertDescription>
			</Alert>
		)
	}

	const products = data?.data?.products || []
	const pagination = data?.data?.pagination
	const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1

	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > totalPages) return
		setCurrentPage(newPage)
	}

	return (
		<div className='space-y-4'>
			{products.length > 0 ? (
				<>
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('products.table.image')}</TableHead>
									<TableHead>{t('products.table.title')}</TableHead>
									<TableHead>{t('products.table.category')}</TableHead>
									<TableHead>{t('products.table.size')}</TableHead>
									<TableHead>{t('products.table.color')}</TableHead>
									<TableHead>{t('products.table.condition')}</TableHead>
									<TableHead>{t('products.table.price')}</TableHead>
									<TableHead>{t('products.table.type')}</TableHead>
									<TableHead>{t('products.table.status')}</TableHead>
									<TableHead>{t('products.table.created')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{products.map((product) => (
									<TableRow key={product.id}>
										<TableCell>
											<ProductImage
												images={product.images}
												title={product.title}
											/>
										</TableCell>
										<TableCell>
											<div className='max-w-48'>
												<p className='truncate font-medium'>
													{product.title}
												</p>
												<p className='truncate text-sm text-muted-foreground'>
													{product.brand}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<div>
												<p className='text-sm font-medium'>
													{product.category}
												</p>
												<p className='text-xs'>{product.subcategory}</p>
											</div>
										</TableCell>
										<TableCell>
											<SizeModal product={product} />
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-2'>
												<div
													className='h-4 w-4 rounded-full border'
													style={{ backgroundColor: product.colorCode }}
												/>
												<span className='text-sm'>{product.color}</span>
											</div>
										</TableCell>
										<TableCell>
											<span className='text-sm'>
												{t(
													`products.conditions.${product.condition}` as any,
												)}
											</span>
										</TableCell>
										<TableCell>
											<PriceDisplay product={product} t={t} />
										</TableCell>
										<TableCell>
											<div className='flex flex-col gap-1'>
												{product.isAuction && (
													<Badge variant='outline' className='text-xs'>
														{t('products.auction')}
													</Badge>
												)}
												{product.isFeatured && (
													<Badge variant='secondary' className='text-xs'>
														{t('products.featured')}
													</Badge>
												)}
												{product.isPremium && (
													<Badge variant='default' className='text-xs'>
														{t('products.premium')}
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant={getStatusBadgeVariant(product.status)}>
												{t(`products.statuses.${product.status}` as any)}
											</Badge>
										</TableCell>
										<TableCell>
											<span>{formatDate(product.createdAt)}</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Pagination Controls */}
					{pagination && (
						<div className='mt-2 flex items-center justify-between'>
							<Button
								variant='outline'
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1 || pagination?.prevPage === false}
								size='sm'>
								{t('pagination.prev')}
							</Button>

							<span className='text-sm'>
								{t('pagination.page')} {currentPage} {t('pagination.of')}{' '}
								{totalPages}
							</span>

							<Button
								variant='outline'
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={
									currentPage === totalPages || pagination?.nextPage === false
								}
								size='sm'>
								{t('pagination.next')}
							</Button>
						</div>
					)}

					{/* Pagination Summary */}
					{pagination && (
						<div className='mt-1 flex justify-between text-sm'>
							<span className='text-muted-foreground'>
								{t('pagination.showing')} {products.length} {t('pagination.of')}{' '}
								{pagination.total} {t('products.itemNames')}
							</span>
						</div>
					)}
				</>
			) : (
				<div className='py-8 text-center text-muted-foreground'>
					{t('products.noProducts')}
				</div>
			)}
		</div>
	)
}
