'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
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
import { updateColor, type Color } from '@/lib/api/colors'
import { useToast } from '@/components/ui/use-toast'

interface EditColorModalProps {
	color: Color
	isOpen: boolean
	onClose: () => void
}

export function EditColorModal({ color, isOpen, onClose }: EditColorModalProps) {
	const [name, setName] = useState('')
	const [code, setCode] = useState('#000000')
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const t = useTranslations()

	useEffect(() => {
		if (color) {
			setName(color[0])
			setCode(color[1])
		}
	}, [color])

	const updateColorMutation = useMutation({
		mutationFn: updateColor,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['colors'] })
			toast({
				title: t('colors.colorUpdated') || 'Color updated',
				description:
					t('colors.colorUpdatedDescription') ||
					'The color has been updated successfully.',
			})
			onClose()
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

		updateColorMutation.mutate({
			name: color[0], // original name
			newName: name.trim(),
			code,
		})
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>{t('colors.editColor') || 'Edit Color'}</DialogTitle>
					<DialogDescription>
						{t('colors.editColorDescription') || 'Update the color information.'}
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
								placeholder={t('colors.editNamePlaceholder') || 'Enter color name'}
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
						<Button type='button' variant='outline' onClick={onClose}>
							{t('common.cancel') || 'Cancel'}
						</Button>
						<Button type='submit' disabled={updateColorMutation.isPending}>
							{updateColorMutation.isPending
								? t('common.updating') || 'Updating...'
								: t('common.update')}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
