'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { getAllProducts, type Product } from '@/lib/api/products'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ChevronLeft, ChevronRight, Loader2, MoreHorizontal, Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { imageUrl } from '@/lib/utils'
import { ProductActionsModal } from './product-actions-modal'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function ProductsTable() {
	const t = useTranslations()
	const [page, setPage] = useState(1)
	const [limit] = useState(10)
	const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const [isActionsModalOpen, setIsActionsModalOpen] = useState(false)

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['products', page, limit],
		queryFn: () => getAllProducts(page, limit),
	})

	const handlePreviousPage = () => {
		setPage((prev) => Math.max(prev - 1, 1))
	}

	const handleNextPage = () => {
		if (data?.data?.pagination && page < Math.ceil(data.data.pagination.total / limit)) {
			setPage((prev) => prev + 1)
		}
	}

	const handleImageError = (productId: number) => {
		setImageErrors((prev) => ({ ...prev, [productId]: true }))
	}

	const handleActionsClick = (product: Product) => {
		setSelectedProduct(product)
		setIsActionsModalOpen(true)
	}

	const handleCloseActionsModal = () => {
		setIsActionsModalOpen(false)
		setSelectedProduct(null)
	}

	const getStatusBadge = (status: string) => {
		const statusColors = {
			live: 'bg-green-100 text-green-800',
			inactive: 'bg-gray-100 text-gray-800',
			pending: 'bg-yellow-100 text-yellow-800',
			sold: 'bg-blue-100 text-blue-800',
		}

		return (
			<Badge
				className={
					statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
				}>
				{status}
			</Badge>
		)
	}

	const getConditionBadge = (condition: string) => {
		const conditionColors = {
			new: 'bg-green-100 text-green-800',
			like_new: 'bg-blue-100 text-blue-800',
			good: 'bg-yellow-100 text-yellow-800',
			fair: 'bg-orange-100 text-orange-800',
			poor: 'bg-red-100 text-red-800',
		}

		return (
			<Badge
				variant='outline'
				className={
					conditionColors[condition as keyof typeof conditionColors] ||
					'bg-gray-100 text-gray-800'
				}>
				{condition.replace('_', ' ')}
			</Badge>
		)
	}

	if (isLoading) {
		return (
			<div className='flex justify-center py-8'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		)
	}

	if (isError) {
		return (
			<Alert variant='destructive' className='my-4'>
				<AlertDescription>
					{error instanceof Error ? error.message : 'Failed to load products'}
				</AlertDescription>
			</Alert>
		)
	}

	const products = data?.data?.products || []
	const pagination = data?.data?.pagination || { page: 1, limit, total: 0 }
	const totalPages = Math.ceil(pagination.total / pagination.limit)

	return (
		<div className='space-y-4'>
			{/* Add Product Button */}
			<div className='flex justify-end'>
				<Link href={`/dashboard/products/add`}>
					<Button>
						<Plus className='mr-2 h-4 w-4' />
						{t('products.addProduct') || 'Add Product'}
					</Button>
				</Link>
			</div>

			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('products.product') || 'Product'}</TableHead>
							<TableHead>{t('products.seller') || 'Seller'}</TableHead>
							<TableHead>{t('products.category') || 'Category'}</TableHead>
							<TableHead>{t('products.price') || 'Price'}</TableHead>
							<TableHead>{t('products.condition') || 'Condition'}</TableHead>
							<TableHead>{t('products.status') || 'Status'}</TableHead>
							<TableHead>{t('products.premium') || 'Premium'}</TableHead>
							<TableHead>{t('products.createdAt') || 'Created'}</TableHead>
							<TableHead className='text-right'>
								{t('products.actions') || 'Actions'}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={9}
									className='py-8 text-center text-muted-foreground'>
									{t('products.noProducts') || 'No products found'}
								</TableCell>
							</TableRow>
						) : (
							products.map((product: Product) => (
								<TableRow key={product.id}>
									<TableCell>
										<div className='flex items-center gap-3'>
											<div className='h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100'>
												{product.images.length > 0 &&
												!imageErrors[product.id] ? (
													<img
														src={
															imageUrl(product.images[0].url) ||
															'/placeholder.svg'
														}
														alt={product.title}
														className='h-full w-full object-cover'
														onError={() => handleImageError(product.id)}
													/>
												) : (
													<div className='flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-400'>
														No Image
													</div>
												)}
											</div>
											<div className='min-w-0 max-w-xs flex-1'>
												<p
													className='line-clamp-2 text-sm font-medium leading-tight'
													title={product.title}>
													{product.title}
												</p>
												<p className='text-xs text-muted-foreground'>
													ID: {product.id} • {product.brand}
												</p>
												{product.isAuction && (
													<Badge
														variant='secondary'
														className='mt-1 text-xs'>
														{t('products.auction') || 'Auction'}
													</Badge>
												)}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className='flex items-center gap-2'>
											<Avatar className='h-8 w-8'>
												<AvatarImage
													src={
														imageUrl(product.seller.avatarUrl) ||
														'/placeholder.svg'
													}
													alt={`${product.seller.firstName} ${product.seller.lastName}`}
												/>
												<AvatarFallback className='text-xs'>
													{product.seller.firstName.charAt(0)}
													{product.seller.lastName.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className='text-sm font-medium'>
													{product.seller.firstName}{' '}
													{product.seller.lastName}
												</p>
												<p className='text-xs text-muted-foreground'>
													@{product.seller.username}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div>
											<p className='text-sm font-medium'>
												{product.category}
											</p>
											<p className='text-xs text-muted-foreground'>
												{product.subcategory}
											</p>
										</div>
									</TableCell>
									<TableCell>
										<p className='font-medium'>${product.price}</p>
										{product.size && (
											<p className='text-xs text-muted-foreground'>
												Size: {product.size}
											</p>
										)}
									</TableCell>
									<TableCell>{getConditionBadge(product.condition)}</TableCell>
									<TableCell>{getStatusBadge(product.status)}</TableCell>
									<TableCell className='text-center'>
										{product.isPremium ? (
											<Badge className='bg-purple-100 text-purple-800'>
												{t('products.premium') || 'Premium'}
											</Badge>
										) : (
											<span className='text-sm text-muted-foreground'>-</span>
										)}
									</TableCell>
									<TableCell>
										<p className='text-sm'>
											{format(new Date(product.createdAt), 'MMM d, yyyy')}
										</p>
										<p className='text-xs text-muted-foreground'>
											{format(new Date(product.createdAt), 'HH:mm')}
										</p>
									</TableCell>
									<TableCell className='text-right'>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => handleActionsClick(product)}
											className='h-8 w-8 p-0'>
											<MoreHorizontal className='h-4 w-4' />
											<span className='sr-only'>
												{t('products.openActions') || 'Open actions'}
											</span>
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{products.length > 0 && (
				<div className='flex items-center justify-between'>
					<div className='text-sm text-muted-foreground'>
						{t('pagination.showing') || 'Showing'} {(page - 1) * limit + 1}{' '}
						{t('pagination.to') || 'to'} {Math.min(page * limit, pagination.total)}{' '}
						{t('pagination.of') || 'of'} {pagination.total}{' '}
						{t('products.itemsName') || 'products'}
					</div>
					<div className='flex items-center space-x-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={handlePreviousPage}
							disabled={page <= 1}>
							<ChevronLeft className='mr-1 h-4 w-4' />
							{t('pagination.prev') || 'Previous'}
						</Button>
						<div className='text-sm'>
							{t('pagination.page') || 'Page'} {page} {t('pagination.of') || 'of'}{' '}
							{totalPages}
						</div>
						<Button
							variant='outline'
							size='sm'
							onClick={handleNextPage}
							disabled={page >= totalPages}>
							{t('pagination.next') || 'Next'}
							<ChevronRight className='ml-1 h-4 w-4' />
						</Button>
					</div>
				</div>
			)}

			{/* Product Actions Modal */}
			<ProductActionsModal
				isOpen={isActionsModalOpen}
				onClose={handleCloseActionsModal}
				product={selectedProduct}
			/>
		</div>
	)
}
