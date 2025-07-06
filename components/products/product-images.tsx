'use client'

import type React from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import Dropzone from 'react-dropzone'
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
	TouchSensor,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useToast } from '@/components/ui/use-toast'
import { imageUrl } from '@/lib/utils'

export type UploadedImage = {
	id: string | number
	url: string
	image: File | null
	filename: string | null
}

export default function ProductImages({
	uploadedImages,
	setUploadedImages,
}: {
	uploadedImages: UploadedImage[]
	setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>
}) {
	const { toast } = useToast()

	const handleImagePreview = (files: File[]) => {
		for (let i = 0; i < files.length; i++) {
			const file = files[i]
			if (file.size > 10 * 1024 * 1024) {
				toast({
					title: 'Error',
					description: `Image too large. Maximum file size is 10MB.`,
					variant: 'destructive',
				})
				return
			}
			if (uploadedImages.some((v) => v.filename === file.name)) continue
			const newImage = {
				id: Math.random().toString(36).substr(2, 9),
				url: URL.createObjectURL(file),
				image: file,
				filename: file.name,
			}
			setUploadedImages((prev) => [...prev, newImage])
		}
	}

	const handleImageRemove = (id: string | number) => {
		setUploadedImages((prev) => prev.filter((img) => img.id !== id))
	}

	const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))

	const handleDragEnd = (event: any) => {
		const { active, over } = event
		if (active.id !== over?.id) {
			const oldIndex = uploadedImages.findIndex((img) => img.id === active.id)
			const newIndex = uploadedImages.findIndex((img) => img.id === over.id)
			setUploadedImages((prev) => arrayMove(prev, oldIndex, newIndex))
		}
	}

	return (
		<div className='space-y-4'>
			<Dropzone onDrop={handleImagePreview}>
				{({ getRootProps, getInputProps }) => (
					<div
						{...getRootProps()}
						className='flex h-[200px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted transition-colors hover:bg-muted/80'>
						<input
							{...getInputProps()}
							accept='image/png, image/jpg, image/jpeg, image/webp, image/heic'
						/>
						<div className='flex items-center justify-center rounded-md bg-muted-foreground/50 p-3 text-white'>
							<Plus className='h-6 w-6' />
						</div>
					</div>
				)}
			</Dropzone>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}>
				<SortableContext
					items={uploadedImages.map((img) => img.id)}
					strategy={rectSortingStrategy}>
					<div className='grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6'>
						{uploadedImages.map((image) => (
							<SortableImageCard
								key={image.id}
								image={image}
								onRemove={handleImageRemove}
							/>
						))}
					</div>
				</SortableContext>
			</DndContext>
		</div>
	)
}

function SortableImageCard({
	image,
	onRemove,
}: {
	image: UploadedImage
	onRemove: (id: string | number) => void
}) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: image.id,
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			className='group relative h-[90px] overflow-hidden rounded-2xl bg-muted xl:h-[120px]'>
			<div {...listeners} className='absolute inset-0 z-0 cursor-move'>
				{/* This makes the full card draggable */}
			</div>

			<Image
				src={imageUrl(image.url) || '/placeholder.svg'}
				alt='Uploaded'
				fill
				className='pointer-events-none object-cover'
				unoptimized
			/>

			<button
				onClick={() => onRemove(image.id)}
				type='button'
				className='absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100'>
				<Plus className='h-4 w-4 rotate-45' />
			</button>
		</div>
	)
}
