'use client'
import { useState, forwardRef, useImperativeHandle } from 'react'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import SizeSettingModal from './size-setting-modal'
import { Info, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getAllBrands } from '@/lib/api/brands'
import { getAllCategoriesSubcategories } from '@/lib/api/categories'
import { getAllColors } from '@/lib/api/colors'
import ProductImages, { type UploadedImage } from './product-images'
import type { Product } from '@/lib/api/products'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { xxHash } from '@/lib/utils'
import { imageUrl } from '@/lib/utils'
import { useTranslations } from 'use-intl'

export type ProductFormRef = {
	setDefaultValues: (value: Product) => void
	submit: () => void
}

interface ProductFormProps {
	updateMode?: boolean
	submit: (values: any) => void
	loading?: boolean
	mutationPending?: boolean
	error?: boolean
}

interface FormData {
	title: string
	brand: string
	brandImage: string
	price: string
	size: string
	category: string
	subcategory: string
	condition: string
	description: string
	material: string
	color: string
	colorCode: string
	isAuction: boolean
	startDate: string
	endDate: string
	productHeight: string
	chestMeasurement: string
	waistMeasurement: string
	hipsMeasurement: string
	sellerId: string
	status: 'pending_approval' | 'draft' | 'live' | 'auction_ended' | 'sold' | 'archived'
	isFeatured: boolean
	isPremium: boolean
	images: File[]
}

interface FormErrors {
	[key: string]: string
}

const ProductFormNew = forwardRef<ProductFormRef, ProductFormProps>((props, ref) => {
	const t = useTranslations()
	const { toast } = useToast()
	const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
	const [publishMode, setPublishMode] = useState<'publish' | 'draft'>('draft')
	const [imagesHash, setImagesHash] = useState('')
	const [sizeSettingOpen, setSizeSettingOpen] = useState(false)
	const [errors, setErrors] = useState<FormErrors>({})
	const [colorSelectionType, setColorSelectionType] = useState<'predefined' | 'custom'>(
		'predefined',
	)
	const [formData, setFormData] = useState<FormData>({
		title: '',
		brand: '',
		brandImage: '',
		price: '',
		size: '',
		category: '',
		subcategory: '',
		condition: '',
		description: '',
		material: '',
		color: '',
		colorCode: '',
		isAuction: false,
		startDate: '',
		endDate: '',
		productHeight: '',
		chestMeasurement: '',
		waistMeasurement: '',
		hipsMeasurement: '',
		sellerId: '',
		status: 'draft',
		isFeatured: false,
		isPremium: false,
		images: [],
	})

	// Fetch brands, categories, and colors with error handling
	const {
		data: brandsData,
		isLoading: brandsLoading,
		error: brandsError,
	} = useQuery({
		queryKey: ['brands'],
		queryFn: getAllBrands,
		retry: 3,
	})

	const {
		data: categoriesData,
		isLoading: categoriesLoading,
		error: categoriesError,
	} = useQuery({
		queryKey: ['categories-subcategories'],
		queryFn: getAllCategoriesSubcategories,
		retry: 3,
	})

	const {
		data: colorsData,
		isLoading: colorsLoading,
		error: colorsError,
	} = useQuery({
		queryKey: ['colors'],
		queryFn: getAllColors,
		retry: 3,
	})

	// Safe data access with fallbacks
	const brands = brandsData?.data || []
	const categories = categoriesData?.data || {}
	const colors = colorsData?.data || []

	// Update form field
	const updateField = (field: keyof FormData, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }))
		}
	}

	// Handle color selection
	const handleColorSelection = (value: string) => {
		if (value === 'custom') {
			setColorSelectionType('custom')
			updateField('color', '')
			updateField('colorCode', '')
		} else {
			setColorSelectionType('predefined')
			// Find the selected color from the colors array
			const selectedColor = colors.find((color) => color[0] === value)
			if (selectedColor) {
				updateField('color', selectedColor[0]) // color name
				updateField('colorCode', selectedColor[1]) // color hex code
			}
		}
	}

	// Validation function
	const validateForm = (): boolean => {
		const newErrors: FormErrors = {}

		if (!formData.title) {
			newErrors.title = 'Title is required'
		}
		if (!formData.brand) {
			newErrors.brand = 'Brand is required'
		}
		if (!formData.price) {
			newErrors.price = 'Price is required'
		}
		if (!formData.size) {
			newErrors.size = 'Size is required'
		}
		if (!formData.category) {
			newErrors.category = 'Category is required'
		}
		if (!formData.subcategory) {
			newErrors.subcategory = 'Subcategory is required'
		}
		if (!formData.condition) {
			newErrors.condition = 'Condition is required'
		}
		if (!formData.sellerId) {
			newErrors.sellerId = 'Seller ID is required'
		}
		if (!props.updateMode && uploadedImages.filter((img) => img.image).length === 0) {
			newErrors.images = 'At least 1 image is required'
		}

		// Auction validation
		if (formData.isAuction) {
			if (!formData.startDate) {
				newErrors.startDate = 'Start date is required for auctions'
			}
			if (!formData.endDate) {
				newErrors.endDate = 'End date is required for auctions'
			}
			if (
				formData.startDate &&
				formData.endDate &&
				new Date(formData.startDate) >= new Date(formData.endDate)
			) {
				newErrors.endDate = 'End date must be after start date'
			}
		}

		// Color validation for custom colors
		if (colorSelectionType === 'custom' && formData.color && !formData.colorCode) {
			newErrors.color = 'Color code is required when color is specified'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	// Set default values for edit mode
	const setDefaultValues = async (values: Product) => {
		try {
			console.log('Setting default values with:', values)

			setFormData({
				title: values.title || '',
				brand: values.brand || '',
				brandImage: values.brandImage || '',
				price: values.price?.toString() || '',
				size: values.size || '',
				category: values.category || '',
				subcategory: values.subcategory || '',
				condition: values.condition || '',
				description: values.description || '',
				material: values.material || '',
				color: values.color || '',
				colorCode: values.colorCode || '',
				isAuction: values.isAuction || false,
				startDate: values.startDate
					? new Date(values.startDate).toISOString().slice(0, 16)
					: '',
				endDate: values.endDate ? new Date(values.endDate).toISOString().slice(0, 16) : '',
				productHeight: values.productHeight?.toString() || '',
				chestMeasurement: values.chestMeasurement?.toString() || '',
				waistMeasurement: values.waistMeasurement?.toString() || '',
				hipsMeasurement: values.hipsMeasurement?.toString() || '',
				sellerId: values.sellerId?.toString() || '',
				status: (values.status as any) || 'draft',
				isFeatured: values.isFeatured || false,
				isPremium: values.isPremium || false,
				images: [],
			})

			// Determine if the existing color is predefined or custom
			if (values.color && colors.length > 0) {
				const isPredefined = colors.some((color) => color[0] === values.color)
				setColorSelectionType(isPredefined ? 'predefined' : 'custom')
			}

			// Set images safely
			if (values.images && Array.isArray(values.images)) {
				console.log('Processing images:', values.images)
				const initialImages = values.images.map((v) => ({
					...v,
					image: null,
					filename: null,
				}))
				setUploadedImages(initialImages)

				try {
					const hash = await xxHash(JSON.stringify(initialImages))
					setImagesHash(hash)
				} catch (hashError) {
					console.error('Error creating hash:', hashError)
					// Continue without hash if it fails
					setImagesHash('')
				}
			}
		} catch (error) {
			console.error('Error setting default values:', error)
			console.error('Error details:', {
				message: (error as any).message,
				stack: (error as any).stack,
				values: values,
			})
			toast({
				title: 'Error',
				description: `Failed to load product data: ${(error as any).message}`,
				variant: 'destructive',
			})
		}
	}

	// Submit function
	const handleSubmit = async (mode?: 'publish' | 'draft') => {
		try {
			if (!props.updateMode && mode) setPublishMode(mode)

			// Update images in form data
			const imageFiles = uploadedImages.filter((v) => v.image).map((v) => v.image!)
			const updatedFormData = { ...formData, images: imageFiles }

			// Validate form
			if (!validateForm()) {
				toast({
					title: 'Validation Error',
					description: 'Please fix the errors in the form',
					variant: 'destructive',
				})
				return
			}

			// Prepare submission data
			const submissionData = { ...updatedFormData }
			if (!props.updateMode) {
				// @ts-ignore
				submissionData.mode = mode || publishMode
			}

			if (props.updateMode) {
				// Check if images were updated
				const newHash = await xxHash(JSON.stringify(uploadedImages))
				if (newHash !== imagesHash) {
					const sortedImages = uploadedImages.map((v) =>
						v.image
							? { url: null, filename: v.filename }
							: { url: v.url, filename: null },
					)
					// @ts-ignore
					submissionData.sortedImages = JSON.stringify(sortedImages)
				}
			}

			props.submit(submissionData)
		} catch (error) {
			console.error('Submit error:', error)
			toast({
				title: 'Error',
				description: 'Failed to submit form',
				variant: 'destructive',
			})
		}
	}

	// Handle brand selection
	const handleBrandChange = (brandName: string) => {
		updateField('brand', brandName)
		if (Array.isArray(brands)) {
			const brand = brands.find((b) => b.name === brandName)
			if (brand) {
				updateField('brandImage', brand.imageUrl)
			}
		}
	}

	// Handle category reset
	const handleResetCategory = () => {
		updateField('category', '')
		updateField('subcategory', '')
	}

	// Handle size modal data
	const handleSizeModalSubmit = () => {
		setSizeSettingOpen(false)
	}

	// Expose methods via ref
	useImperativeHandle(ref, () => ({
		setDefaultValues,
		submit: handleSubmit,
	}))

	// Loading state
	if (props.loading || brandsLoading || categoriesLoading || colorsLoading) {
		return (
			<div className='flex justify-center py-10'>
				<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
			</div>
		)
	}

	// Error state
	if (props.error || brandsError || categoriesError || colorsError) {
		return (
			<div className='flex justify-center py-10'>
				<p className='text-destructive'>Error loading form data</p>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			{/* Image Upload Section */}
			<div className='rounded-xl border p-6'>
				<div className='mb-4 text-muted-foreground'>
					<p>
						Upload up to 20 photos.{' '}
						<a href='#' className='text-primary hover:underline'>
							Tips
						</a>
					</p>
					<p>First photo will be the cover photo.</p>
				</div>

				<ProductImages
					uploadedImages={uploadedImages}
					setUploadedImages={setUploadedImages}
				/>

				{/* Warning Message */}
				<div className='mt-6 flex gap-2 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-muted-foreground dark:border-yellow-800 dark:bg-yellow-900/20'>
					<Info className='mt-0.5 h-5 w-5 flex-shrink-0' />
					<div>
						<p className='font-semibold'>Important Notice</p>
						<p>Make sure your product images are clear and show the item accurately.</p>
						<a href='#' className='text-primary hover:underline'>
							Read more
						</a>
					</div>
				</div>

				{errors.images && <p className='mt-2 text-sm text-destructive'>{errors.images}</p>}
			</div>

			<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
				{/* Title */}
				<div className='rounded-xl border px-3 py-2'>
					<Label className='text-sm text-muted-foreground'>Title</Label>
					<Input
						placeholder='Enter product title'
						className='mt-1 border-0 px-0 focus-visible:ring-0'
						value={formData.title}
						onChange={(e) => updateField('title', e.target.value)}
					/>
					{errors.title && (
						<p className='mt-1 text-sm text-destructive'>{errors.title}</p>
					)}
				</div>

				{/* Brand */}
				<div className='rounded-xl border px-3 py-2'>
					<Label className='text-sm text-muted-foreground'>Brand</Label>
					<Select value={formData.brand} onValueChange={handleBrandChange}>
						<SelectTrigger className='mt-1 border-0 px-0 focus:ring-0'>
							<SelectValue placeholder='Select a brand' />
						</SelectTrigger>
						<SelectContent>
							{Array.isArray(brands) &&
								brands.map((brand) => (
									<SelectItem key={brand.name} value={brand.name}>
										<div className='flex items-center'>
											<img
												src={imageUrl(brand.imageUrl) || '/placeholder.svg'}
												alt={brand.name}
												className='mr-2 h-6 w-6 rounded-full'
											/>
											{brand.name}
										</div>
									</SelectItem>
								))}
						</SelectContent>
					</Select>
					{errors.brand && (
						<p className='mt-1 text-sm text-destructive'>{errors.brand}</p>
					)}
				</div>

				{/* Price */}
				<div className='rounded-xl border px-3 py-2'>
					<Label className='text-sm text-muted-foreground'>Price</Label>
					<div className='mt-1 flex items-center'>
						<span className='mr-2 text-lg font-semibold'>$</span>
						<Input
							type='number'
							className='border-0 px-0 focus-visible:ring-0'
							min='10.00'
							step='0.01'
							value={formData.price}
							onChange={(e) => updateField('price', e.target.value)}
						/>
					</div>
					{errors.price && (
						<p className='mt-1 text-sm text-destructive'>{errors.price}</p>
					)}
				</div>

				{/* Size */}
				<div className='space-y-2 rounded-xl border px-3 py-2'>
					<Label className='text-sm text-muted-foreground'>Size</Label>

					{errors.size && <p className='text-sm text-destructive'>{errors.size}</p>}

					{/* Size Details Button */}
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={() => setSizeSettingOpen(true)}
						className='w-full'>
						Set Size Details
					</Button>
				</div>

				{/* Category */}
				<div className='space-y-2 rounded-xl border px-3 py-2'>
					<Label className='text-sm text-muted-foreground'>Category / Subcategory</Label>
					{formData.category ? (
						<div className='flex items-center gap-3 px-3 text-sm'>
							<button type='button' onClick={handleResetCategory}>
								<XCircle className='size-[18px] text-muted-foreground' />
							</button>
							<p className='text-nowrap'>{formData.category}</p>
							<p className='text-[22px] text-muted-foreground'>→</p>
							<Select
								value={formData.subcategory}
								onValueChange={(value) => updateField('subcategory', value)}>
								<SelectTrigger className='border-0 px-0 focus:ring-0'>
									<SelectValue placeholder='Select a subcategory' />
								</SelectTrigger>
								<SelectContent>
									{categories[formData.category]?.subcategories &&
										Array.isArray(
											categories[formData.category].subcategories,
										) &&
										categories[formData.category].subcategories.map((v) => (
											<SelectItem key={v[0]} value={v[0]}>
												{v[0]}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>
					) : (
						<Select
							value={formData.category}
							onValueChange={(value) => updateField('category', value)}>
							<SelectTrigger className='border-0 px-0 text-sm focus-visible:ring-0'>
								<SelectValue placeholder='Select a category' />
							</SelectTrigger>
							<SelectContent>
								{Object.keys(categories).map((v) => (
									<SelectItem key={v} value={v}>
										{v}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
					{errors.category && (
						<p className='text-sm text-destructive'>{errors.category}</p>
					)}
					{errors.subcategory && (
						<p className='text-sm text-destructive'>{errors.subcategory}</p>
					)}
				</div>

				{/* Condition */}
				<div className='rounded-xl border px-3 py-2'>
					<Label className='text-sm text-muted-foreground'>Condition</Label>
					<Select
						value={formData.condition}
						onValueChange={(value) => updateField('condition', value)}>
						<SelectTrigger className='mt-1 border-0 px-0 focus:ring-0'>
							<SelectValue placeholder='Select condition' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='new'>New</SelectItem>
							<SelectItem value='used'>Used</SelectItem>
							<SelectItem value='like_new'>Like New</SelectItem>
							<SelectItem value='excellent'>Excellent</SelectItem>
							<SelectItem value='very_good'>Very Good</SelectItem>
							<SelectItem value='good'>Good</SelectItem>
							<SelectItem value='fair'>Fair</SelectItem>
							<SelectItem value='poor'>Poor</SelectItem>
						</SelectContent>
					</Select>
					{errors.condition && (
						<p className='mt-1 text-sm text-destructive'>{errors.condition}</p>
					)}
				</div>

				{/* Seller ID */}
				<div className='rounded-xl border px-3 py-2'>
					<Label className='text-sm text-muted-foreground'>Seller ID</Label>
					<Input
						type='number'
						placeholder='Enter seller ID'
						className='mt-1 border-0 px-0 focus-visible:ring-0'
						value={formData.sellerId}
						onChange={(e) => updateField('sellerId', e.target.value)}
					/>
					{errors.sellerId && (
						<p className='mt-1 text-sm text-destructive'>{errors.sellerId}</p>
					)}
				</div>

				{/* Status */}
				<div className='rounded-xl border px-3 py-2'>
					<Label className='text-sm text-muted-foreground'>Status</Label>
					<Select
						value={formData.status}
						onValueChange={(value) => updateField('status', value)}>
						<SelectTrigger className='mt-1 border-0 px-0 focus:ring-0'>
							<SelectValue placeholder='Select status' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='pending_approval'>Pending Approval</SelectItem>
							<SelectItem value='draft'>Draft</SelectItem>
							<SelectItem value='live'>Live</SelectItem>
							<SelectItem value='auction_ended'>Auction Ended</SelectItem>
							<SelectItem value='sold'>Sold</SelectItem>
							<SelectItem value='archived'>Archived</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Material */}
				<div className='rounded-xl border px-3 py-2'>
					<Label className='text-sm text-muted-foreground'>Material</Label>
					<Input
						placeholder='e.g., Cotton, Polyester'
						className='mt-1 border-0 px-0 focus-visible:ring-0'
						value={formData.material}
						onChange={(e) => updateField('material', e.target.value)}
					/>
				</div>

				{/* Enhanced Color Field */}
				<div className='rounded-xl border px-3 py-2'>
					<div className='mb-2 flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Label className='text-sm text-muted-foreground'>Color</Label>
							{colorSelectionType === 'predefined' && formData.color && (
								<span className='rounded bg-muted px-2 py-1 text-xs'>
									Seleccione Predefinido
								</span>
							)}
						</div>
						{colorSelectionType === 'custom' && (
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => {
									setColorSelectionType('predefined')
									updateField('color', '')
									updateField('colorCode', '')
								}}>
								Use Predefined
							</Button>
						)}
					</div>

					{colorSelectionType === 'predefined' ? (
						<div className='space-y-2'>
							{formData.color ? (
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<div
											className='h-4 w-4 rounded-full border'
											style={{ backgroundColor: formData.colorCode }}
										/>
										<span className='text-sm'>{formData.color}</span>
									</div>
									<Button
										type='button'
										variant='outline'
										size='sm'
										onClick={() => handleColorSelection('custom')}>
										Selecciona un color
									</Button>
								</div>
							) : (
								<Select value={formData.color} onValueChange={handleColorSelection}>
									<SelectTrigger className='border-0 px-0 focus:ring-0'>
										<SelectValue placeholder='Seleccione un color' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='custom'>
											<span className='font-medium'>Añade tu color</span>
										</SelectItem>
										{Array.isArray(colors) &&
											colors.map((color) => (
												<SelectItem key={color[0]} value={color[0]}>
													<div className='flex items-center gap-2'>
														<div
															className='h-4 w-4 rounded-full border'
															style={{ backgroundColor: color[1] }}
														/>
														{color[0]}
													</div>
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							)}
						</div>
					) : (
						<div className='space-y-2'>
							<div className='flex items-center justify-between'>
								<Input
									placeholder='e.g., Red, Blue'
									className='mr-3 flex-1 border-0 px-0 focus-visible:ring-0'
									value={formData.color}
									onChange={(e) => updateField('color', e.target.value)}
								/>
								{formData.color && (
									<label
										htmlFor='product-color-picker-input'
										className='block w-[120px] cursor-pointer rounded-md border px-3 py-1 text-sm font-semibold text-muted-foreground'
										style={{
											backgroundColor: formData.colorCode || '#f9f9f9',
										}}>
										{!formData.colorCode ? 'Pick color' : ''}
										<input
											id='product-color-picker-input'
											type='color'
											className='invisible h-0 w-0'
											onChange={(e) =>
												updateField('colorCode', e.target.value)
											}
											value={formData.colorCode || '#ffffff'}
										/>
									</label>
								)}
							</div>
						</div>
					)}
					{errors.color && (
						<p className='mt-1 text-sm text-destructive'>{errors.color}</p>
					)}
				</div>
			</div>

			{/* Description */}
			<div className='rounded-xl border px-3 py-2'>
				<Label className='text-sm text-muted-foreground'>Description</Label>
				<Textarea
					placeholder='Describe your product...'
					className='mt-1 min-h-[100px] border-0 px-0 focus-visible:ring-0'
					value={formData.description}
					onChange={(e) => updateField('description', e.target.value)}
				/>
				{errors.description && (
					<p className='mt-1 text-sm text-destructive'>{errors.description}</p>
				)}
			</div>

			{/* Feature Toggles */}
			<div className='space-y-4'>
				<div className='flex items-center gap-3'>
					<Switch
						checked={formData.isFeatured}
						onCheckedChange={(checked) => updateField('isFeatured', checked)}
					/>
					<Label>Featured Product</Label>
				</div>

				<div className='flex items-center gap-3'>
					<Switch
						checked={formData.isPremium}
						onCheckedChange={(checked) => updateField('isPremium', checked)}
					/>
					<Label>Premium Product</Label>
				</div>

				<div className='flex items-center gap-3'>
					<Switch
						checked={formData.isAuction}
						onCheckedChange={(checked) => updateField('isAuction', checked)}
					/>
					<Label>Is Auction</Label>
				</div>
			</div>

			{/* Auction Fields */}
			{formData.isAuction && (
				<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
					<div className='rounded-xl border px-3 py-2'>
						<Label className='text-sm text-muted-foreground'>
							Auction Start Date & Time
						</Label>
						<Input
							type='datetime-local'
							className='mt-1 border-0 px-0 focus-visible:ring-0'
							value={formData.startDate}
							onChange={(e) => updateField('startDate', e.target.value)}
						/>
						{errors.startDate && (
							<p className='mt-1 text-sm text-destructive'>{errors.startDate}</p>
						)}
					</div>

					<div className='rounded-xl border px-3 py-2'>
						<Label className='text-sm text-muted-foreground'>
							Auction End Date & Time
						</Label>
						<Input
							type='datetime-local'
							className='mt-1 border-0 px-0 focus-visible:ring-0'
							value={formData.endDate}
							onChange={(e) => updateField('endDate', e.target.value)}
						/>
						{errors.endDate && (
							<p className='mt-1 text-sm text-destructive'>{errors.endDate}</p>
						)}
					</div>
				</div>
			)}

			{/* Action Buttons */}
			<div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-end'>
				{props.updateMode ? (
					<Button
						className='h-auto w-[200px] px-8 py-4 text-lg font-bold lg:w-[250px]'
						onClick={() => handleSubmit()}
						disabled={props.mutationPending}>
						{props.mutationPending ? 'Updating...' : 'Update Product'}
					</Button>
				) : (
					<Button
						className='h-auto w-[200px] px-8 py-4 text-lg font-bold lg:w-[250px]'
						onClick={() => handleSubmit('publish')}
						disabled={props.mutationPending}>
						{props.mutationPending ? 'Publishing...' : 'Publish Product'}
					</Button>
				)}
			</div>
			<SizeSettingModal
				isOpen={sizeSettingOpen}
				onClose={() => setSizeSettingOpen(false)}
				onSubmit={(measurements) => {
					updateField('productHeight', measurements.height)
					updateField('chestMeasurement', measurements.chest)
					updateField('waistMeasurement', measurements.waist)
					updateField('hipsMeasurement', measurements.hip)
					if (measurements.size) {
						updateField('size', measurements.size)
					}
					setSizeSettingOpen(false)
				}}
				currentValues={{
					size: formData.size,
					height: formData.productHeight,
					chest: formData.chestMeasurement,
					waist: formData.waistMeasurement,
					hip: formData.hipsMeasurement,
				}}
			/>
		</div>
	)
})

ProductFormNew.displayName = 'ProductFormNew'

export default ProductFormNew
