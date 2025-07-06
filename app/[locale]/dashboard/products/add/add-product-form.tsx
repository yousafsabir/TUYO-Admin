'use client'
import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createProduct } from '@/lib/api/products'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import ProductFormNew, { type ProductFormRef } from '@/components/products/product-form-new'

export default function AddProductForm() {
	const router = useRouter()
	const { toast } = useToast()
	const formRef = useRef<ProductFormRef>(null)

	const createProductMutation = useMutation({
		mutationFn: createProduct,
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Product created successfully',
			})
			router.push(`/dashboard/products`)
		},
		onError: (error: any) => {
			console.error('Create product error:', error)
			toast({
				title: 'Error',
				description: error?.message || 'Failed to create product',
				variant: 'destructive',
			})
		},
	})

	const handleSubmit = (values: any) => {
		try {
			const formData = new FormData()

			// Add all form fields to FormData safely
			Object.entries(values).forEach(([key, value]) => {
				if (key === 'images' && Array.isArray(value)) {
					value.forEach((file: File) => {
						if (file instanceof File) {
							formData.append('images', file)
						}
					})
				} else if (value !== null && value !== undefined && value !== '') {
					formData.append(key, value.toString())
				}
			})

			createProductMutation.mutate(formData)
		} catch (error) {
			console.error('Form submission error:', error)
			toast({
				title: 'Error',
				description: 'Failed to prepare form data',
				variant: 'destructive',
			})
		}
	}

	return (
		<ProductFormNew
			ref={formRef}
			submit={handleSubmit}
			mutationPending={createProductMutation.isPending}
		/>
	)
}
