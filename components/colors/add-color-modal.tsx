'use client'

import type React from 'react'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createColor } from '@/lib/api/colors'
import { useToast } from '@/components/ui/use-toast'

interface AddColorModalProps {
	isOpen: boolean
	onClose: () => void
}

export function AddColorModal({ isOpen, onClose }: AddColorModalProps) {
	const [name, setName] = useState('')
	const [code, setCode] = useState('#000000')
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const t = useTranslations()

	const createColorMutation = useMutation({
		mutationFn: createColor,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['colors'] })
			toast({
				title: t('colors.colorCreated') || 'Color created',
				description:
					t('colors.colorCreatedDescription') ||
					'The color has been created successfully.',
			})
			handleClose()
		},
		onError: (error: Error) => {
			toast({
				title: t('common.error') || 'Error',
				description: error.message,
				variant: 'destructive',
			})
		},
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim()) {
			toast({
				title: t('common.error') || 'Error',
				description: t('colors.nameRequired') || 'Color name is required',
				variant: 'destructive',
			})
			return
		}

		createColorMutation.mutate({
			name: name.trim(),
			code,
		})
	}

	const handleClose = () => {
		setName('')
		setCode('#000000')
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>{t('colors.addColor') || 'Add Color'}</DialogTitle>
					<DialogDescription>
						{t('colors.addColorDescription') ||
							'Add a new color to your store configuration.'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className='grid gap-4 py-4'>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='name' className='text-right'>
								{t('colors.name') || 'Name'}
							</Label>
							<Input
								id='name'
								value={name}
								onChange={(e) => setName(e.target.value)}
								className='col-span-3'
								placeholder={t('colors.namePlaceholder') || 'Enter color name'}
								required
							/>
						</div>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='code' className='text-right'>
								{t('colors.color') || 'Color'}
							</Label>
							<div className='col-span-3 flex items-center space-x-2'>
								<Input
									id='code'
									type='color'
									value={code}
									onChange={(e) => setCode(e.target.value)}
									className='h-10 w-16 rounded border p-1'
								/>
								<Input
									value={code}
									onChange={(e) => setCode(e.target.value)}
									placeholder='#000000'
									className='flex-1 font-mono'
									pattern='^#[0-9A-Fa-f]{6}$'
								/>
							</div>
						</div>
						<div className='grid grid-cols-4 items-center gap-4'>
							<div className='text-right text-sm text-muted-foreground'>
								{t('colors.preview') || 'Preview'}
							</div>
							<div className='col-span-3'>
								<div
									className='h-10 w-full rounded border border-gray-300'
									style={{ backgroundColor: code }}
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button type='button' variant='outline' onClick={handleClose}>
							{t('common.cancel') || 'Cancel'}
						</Button>
						<Button type='submit' disabled={createColorMutation.isPending}>
							{createColorMutation.isPending
								? t('common.creating') || 'Creating...'
								: t('colors.addColor') || 'Add Color'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
