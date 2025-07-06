'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteColor, type Color } from '@/lib/api/colors'
import { useToast } from '@/components/ui/use-toast'

interface DeleteColorDialogProps {
	color: Color
	isOpen: boolean
	onClose: () => void
}

export function DeleteColorDialog({ color, isOpen, onClose }: DeleteColorDialogProps) {
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const t = useTranslations()

	const deleteColorMutation = useMutation({
		mutationFn: deleteColor,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['colors'] })
			toast({
				title: t('colors.colorDeleted') || 'Color deleted',
				description:
					t('colors.colorDeletedDescription') ||
					'The color has been deleted successfully.',
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

	const handleDelete = () => {
		deleteColorMutation.mutate({ name: color[0] })
	}

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t('colors.deleteColor') || 'Delete Color'}</AlertDialogTitle>
					<AlertDialogDescription>
						{t('colors.deleteColorConfirmation') ||
							'Are you sure you want to delete this color?'}{' '}
						<span className='font-semibold'>{color[0]}</span>{' '}
						{t('colors.deleteColorWarning') || 'This action cannot be undone.'}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{t('common.cancel') || 'Cancel'}</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={deleteColorMutation.isPending}
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
						{deleteColorMutation.isPending
							? t('common.deleting') || 'Deleting...'
							: t('common.delete') || 'Delete'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
