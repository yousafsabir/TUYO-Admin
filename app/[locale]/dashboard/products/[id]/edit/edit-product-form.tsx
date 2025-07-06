'use client'

import { useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { getProductById, updateProductFull } from '@/lib/api/products'
import ProductFormNew, { type ProductFormRef } from '@/components/products/product-form-new'
import { useToast } from '@/components/ui/use-toast'
import { useLocale } from 'next-intl'

interface EditProductFormProps {
	productId: number
}

export default function EditProductForm({ productId }: EditProductFormProps) {
	const router = useRouter()
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const formRef = useRef<ProductFormRef>(null)
	const locale = useLocale()

	const {
		data: productData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['product', productId],
		queryFn: () => getProductById(productId),
	})

	const updateProductMutation = useMutation({
		mutationFn: (data: FormData) => updateProductFull(productId, data),
		onSuccess: (data) => {
			toast({
				title: 'Success',
				description: 'Product updated successfully',
			})
			queryClient.invalidateQueries({ queryKey: ['products'] })
			queryClient.invalidateQueries({ queryKey: ['product', productId] })
			router.push(`/dashboard/products`)
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to update product',
				variant: 'destructive',
			})
		},
	})

	useEffect(() => {
		if (productData?.data && formRef.current) {
			formRef.current.setDefaultValues(productData.data)
		}
	}, [productData])

	const handleSubmit = (values: any) => {
		const formData = new FormData()

		// Add all form fields to FormData
		Object.keys(values).forEach((key) => {
			if (key === 'images') {
				// Handle multiple images
				values.images.forEach((image: File) => {
					formData.append('images', image)
				})
			} else if (values[key] !== undefined && values[key] !== '') {
				formData.append(key, values[key])
			}
		})

		updateProductMutation.mutate(formData)
	}

	return (
		<ProductFormNew
			ref={formRef}
			updateMode={true}
			submit={handleSubmit}
			loading={isLoading}
			error={!!error}
			mutationPending={updateProductMutation.isPending}
		/>
	)
}
