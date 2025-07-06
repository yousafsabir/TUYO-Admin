'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllBrands, type Brand } from '@/lib/api/brands'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Loader2, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EditBrandModal } from './edit-brand-modal'
import { DeleteBrandDialog } from './delete-brand-dialog'
import { imageUrl } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export function BrandsTable() {
	const t = useTranslations()
	const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null)
	const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
	const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['brands'],
		queryFn: getAllBrands,
	})

	const handleEditClick = (brand: Brand) => {
		setBrandToEdit(brand)
	}

	const handleDeleteClick = (brand: Brand) => {
		setBrandToDelete(brand)
	}

	const handleImageError = (brandName: string) => {
		setImageErrors((prev) => ({ ...prev, [brandName]: true }))
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
					{error instanceof Error ? error.message : 'Failed to load brands'}
				</AlertDescription>
			</Alert>
		)
	}

	const brands = data?.data || []

	return (
		<div className='space-y-4'>
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('brands.image') || 'Image'}</TableHead>
							<TableHead>{t('brands.name') || 'Name'}</TableHead>
							<TableHead className='text-right'>
								{t('brands.actions') || 'Actions'}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{brands.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={3}
									className='py-8 text-center text-muted-foreground'>
									{t('brands.noBrands') || 'No brands found'}
								</TableCell>
							</TableRow>
						) : (
							brands.map((brand: Brand) => (
								<TableRow key={brand.name}>
									<TableCell>
										<div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-50'>
											{!imageErrors[brand.name] ? (
												<img
													src={
														imageUrl(brand.imageUrl) ||
														'/placeholder.svg'
													}
													alt={brand.name}
													className='h-full w-full object-cover'
													onError={() => handleImageError(brand.name)}
												/>
											) : (
												<div className='text-center text-xs text-gray-400'>
													No Image
												</div>
											)}
										</div>
									</TableCell>
									<TableCell className='font-medium'>{brand.name}</TableCell>
									<TableCell className='text-right'>
										<div className='flex justify-end gap-2'>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleEditClick(brand)}
												className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'>
												<Edit className='mr-1 h-4 w-4' />
												{t('brands.edit') || 'Edit'}
											</Button>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleDeleteClick(brand)}
												className='text-destructive hover:bg-destructive/10 hover:text-destructive'>
												<Trash2 className='mr-1 h-4 w-4' />
												{t('brands.delete') || 'Delete'}
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Edit Brand Modal */}
			<EditBrandModal
				isOpen={brandToEdit !== null}
				onClose={() => setBrandToEdit(null)}
				brand={brandToEdit}
			/>

			{/* Delete Brand Dialog */}
			<DeleteBrandDialog
				isOpen={brandToDelete !== null}
				onClose={() => setBrandToDelete(null)}
				brand={brandToDelete}
			/>
		</div>
	)
}
