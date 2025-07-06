'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { createAdmin } from '@/lib/api/auth'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AddAdminModalProps {
	isOpen: boolean
	onClose: () => void
}

export function AddAdminModal({ isOpen, onClose }: AddAdminModalProps) {
	const [error, setError] = useState<string | null>(null)
	const queryClient = useQueryClient()
	const t = useTranslations()

	const adminSchema = z.object({
		name: z.string().min(1, { message: t('admin.errors.nameRequired') }),
		email: z
			.string()
			.min(1, { message: t('admin.errors.emailRequired') })
			.email({ message: t('admin.errors.emailInvalid') }),
		password: z
			.string()
			.min(1, { message: t('admin.errors.passwordRequired') })
			.min(6, { message: t('admin.errors.passwordMinLength') }),
	})

	type AdminFormValues = z.infer<typeof adminSchema>

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<AdminFormValues>({
		resolver: zodResolver(adminSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
		},
	})

	const { mutate: addAdmin, isPending } = useMutation({
		mutationFn: createAdmin,
		onSuccess: () => {
			// Invalidate the admins query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['admins'] })

			// Reset form and close modal
			reset()
			onClose()
		},
		onError: (error: Error) => {
			setError(error.message || 'Failed to create admin')
		},
	})

	const onSubmit = (data: AdminFormValues) => {
		setError(null)
		addAdmin(data)
	}

	const handleClose = () => {
		if (!isPending) {
			reset()
			setError(null)
			onClose()
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>{t('admin.addAdmin') || 'Add Admin'}</DialogTitle>
					<DialogDescription>
						{t('admin.addAdminDescription') || 'Create a new administrator account.'}
					</DialogDescription>
				</DialogHeader>

				{error && (
					<Alert variant='destructive' className='mb-4'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>{t('admin.name') || 'Name'}</Label>
						<Input
							id='name'
							{...register('name')}
							placeholder={t('admin.namePlaceholder') || 'Enter admin name'}
							className={errors.name ? 'border-red-500' : ''}
						/>
						{errors.name && (
							<p className='text-sm text-red-500'>{errors.name.message}</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='email'>{t('admin.email') || 'Email'}</Label>
						<Input
							id='email'
							type='email'
							{...register('email')}
							placeholder={t('admin.emailPlaceholder') || 'Enter admin email'}
							className={errors.email ? 'border-red-500' : ''}
						/>
						{errors.email && (
							<p className='text-sm text-red-500'>{errors.email.message}</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='password'>{t('admin.password') || 'Password'}</Label>
						<Input
							id='password'
							type='password'
							{...register('password')}
							placeholder={t('admin.passwordPlaceholder') || 'Enter admin password'}
							className={errors.password ? 'border-red-500' : ''}
						/>
						{errors.password && (
							<p className='text-sm text-red-500'>{errors.password.message}</p>
						)}
					</div>

					<DialogFooter className='mt-6'>
						<Button
							type='button'
							variant='outline'
							onClick={handleClose}
							disabled={isPending}>
							{t('common.cancel') || 'Cancel'}
						</Button>
						<Button type='submit' disabled={isPending}>
							{isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									{t('common.creating')}
								</>
							) : (
								t('common.create')
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
