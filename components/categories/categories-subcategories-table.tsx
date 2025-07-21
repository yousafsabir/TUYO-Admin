'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllCategoriesSubcategories } from '@/lib/api/categories'
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
import { Edit, Loader2, Trash2, Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AddCategoryModal } from './add-category-modal'
import { EditCategoryModal } from './edit-category-modal'
import { DeleteCategoryDialog } from './delete-category-dialog'
import { AddSubcategoryModal } from '../subcategories/add-subcategory-modal'
import { EditSubcategoryModal } from '../subcategories/edit-subcategory-modal'
import { DeleteSubcategoryDialog } from '../subcategories/delete-subcategory-dialog'
import { subcategoriesIcons, type SubcategoryIconKey } from '@/lib/subcategories-icons'
import { useTranslations } from 'next-intl'

export function CategoriesSubcategoriesTable() {
	const t = useTranslations()
	const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null)
	const [categoryToDelete, setCategoryToDelete] = useState<{
		name: string
		subcategoriesCount: number
	} | null>(null)
	const [subcategoryToEdit, setSubcategoryToEdit] = useState<{
		categoryId: number
		categoryName: string
		name: string
		iconKey: string
	} | null>(null)
	const [subcategoryToDelete, setSubcategoryToDelete] = useState<{
		categoryId: number
		categoryName: string
		name: string
	} | null>(null)
	const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
	const [isAddSubcategoryModalOpen, setIsAddSubcategoryModalOpen] = useState(false)

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['categories-subcategories'],
		queryFn: getAllCategoriesSubcategories,
	})

	const handleEditCategoryClick = (categoryName: string) => {
		setCategoryToEdit(categoryName)
	}

	const handleDeleteCategoryClick = (categoryName: string, subcategoriesCount: number) => {
		setCategoryToDelete({ name: categoryName, subcategoriesCount })
	}

	const handleEditSubcategoryClick = (
		categoryName: string,
		categoryId: number,
		subcategoryName: string,
		iconKey: string,
	) => {
		setSubcategoryToEdit({
			categoryId,
			categoryName,
			name: subcategoryName,
			iconKey,
		})
	}

	const handleDeleteSubcategoryClick = (
		categoryName: string,
		categoryId: number,
		subcategoryName: string,
	) => {
		setSubcategoryToDelete({ categoryId, categoryName, name: subcategoryName })
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
					{error instanceof Error
						? error.message
						: 'Failed to load categories and subcategories'}
				</AlertDescription>
			</Alert>
		)
	}

	const categoriesData = data?.data || {}
	const categories = Object.keys(categoriesData)

	return (
		<div className='space-y-4'>
			<div className='mb-4 flex justify-between'>
				<p>
					{t('categories.description') ||
						'Manage product categories and their subcategories.'}
				</p>
				{/* Action Buttons */}

				<div className='flex gap-2'>
					<Button onClick={() => setIsAddCategoryModalOpen(true)}>
						<Plus className='mr-2 h-4 w-4' />
						{t('categories.addCategory') || 'Add Category'}
					</Button>
					<Button variant='outline' onClick={() => setIsAddSubcategoryModalOpen(true)}>
						<Plus className='mr-2 h-4 w-4' />
						{t('subcategories.addSubcategory') || 'Add Subcategory'}
					</Button>
				</div>
			</div>

			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('categories.category') || 'Category'}</TableHead>
							<TableHead>
								{t('categories.subcategories') || 'Subcategories'}
							</TableHead>
							<TableHead className='text-right'>
								{t('categories.actions') || 'Actions'}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{categories.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={3}
									className='py-8 text-center text-muted-foreground'>
									{t('categories.noCategories') || 'No categories found'}
								</TableCell>
							</TableRow>
						) : (
							categories.map((categoryName) => {
								const categoryData = categoriesData[categoryName]
								const subcategories = categoryData.subcategories || []
								const categoryId = categoryData.id

								return (
									<TableRow key={categoryName}>
										<TableCell>
											<div className='font-medium'>{categoryName}</div>
										</TableCell>
										<TableCell>
											<div className='flex flex-wrap gap-1'>
												{subcategories.length === 0 ? (
													<span className='text-sm text-muted-foreground'>
														{t('categories.noSubcategories') ||
															'No subcategories'}
													</span>
												) : (
													subcategories.map(
														([subcategoryName, iconKey]) => (
															<div
																key={subcategoryName}
																className='flex items-center gap-1'>
																<Badge
																	variant='secondary'
																	className='flex items-center gap-1 text-xs'>
																	{subcategoriesIcons[
																		iconKey as SubcategoryIconKey
																	] || null}
																	{subcategoryName}
																</Badge>
																<div className='flex'>
																	<Button
																		variant='ghost'
																		size='sm'
																		className='h-6 w-6 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700'
																		onClick={() =>
																			handleEditSubcategoryClick(
																				categoryName,
																				categoryId,
																				subcategoryName,
																				iconKey,
																			)
																		}>
																		<Edit className='h-3 w-3' />
																	</Button>
																	<Button
																		variant='ghost'
																		size='sm'
																		className='h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
																		onClick={() =>
																			handleDeleteSubcategoryClick(
																				categoryName,
																				categoryId,
																				subcategoryName,
																			)
																		}>
																		<Trash2 className='h-3 w-3' />
																	</Button>
																</div>
															</div>
														),
													)
												)}
											</div>
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end gap-2'>
												<Button
													variant='ghost'
													size='sm'
													onClick={() =>
														handleEditCategoryClick(categoryName)
													}
													className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'>
													<Edit className='mr-1 h-4 w-4' />
													{t('categories.edit') || 'Edit'}
												</Button>
												<Button
													variant='ghost'
													size='sm'
													onClick={() =>
														handleDeleteCategoryClick(
															categoryName,
															subcategories.length,
														)
													}
													className='text-destructive hover:bg-destructive/10 hover:text-destructive'>
													<Trash2 className='mr-1 h-4 w-4' />
													{t('categories.delete') || 'Delete'}
												</Button>
											</div>
										</TableCell>
									</TableRow>
								)
							})
						)}
					</TableBody>
				</Table>
			</div>

			{/* Modals */}
			<AddCategoryModal
				isOpen={isAddCategoryModalOpen}
				onClose={() => setIsAddCategoryModalOpen(false)}
			/>

			<EditCategoryModal
				isOpen={categoryToEdit !== null}
				onClose={() => setCategoryToEdit(null)}
				categoryName={categoryToEdit}
			/>

			<DeleteCategoryDialog
				isOpen={categoryToDelete !== null}
				onClose={() => setCategoryToDelete(null)}
				categoryName={categoryToDelete?.name || null}
				subcategoriesCount={categoryToDelete?.subcategoriesCount || 0}
			/>

			<AddSubcategoryModal
				isOpen={isAddSubcategoryModalOpen}
				onClose={() => setIsAddSubcategoryModalOpen(false)}
				categoriesData={categoriesData}
			/>

			<EditSubcategoryModal
				isOpen={subcategoryToEdit !== null}
				onClose={() => setSubcategoryToEdit(null)}
				subcategory={subcategoryToEdit}
			/>

			<DeleteSubcategoryDialog
				isOpen={subcategoryToDelete !== null}
				onClose={() => setSubcategoryToDelete(null)}
				subcategory={subcategoryToDelete}
			/>
		</div>
	)
}
