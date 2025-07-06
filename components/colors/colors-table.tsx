'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Search } from 'lucide-react'
import { getAllColors, type Color } from '@/lib/api/colors'
import { EditColorModal } from './edit-color-modal'
import { DeleteColorDialog } from './delete-color-dialog'
import { useToast } from '@/components/ui/use-toast'

interface ColorsTableProps {}

export function ColorsTable({}: ColorsTableProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [editingColor, setEditingColor] = useState<Color | null>(null)
	const [deletingColor, setDeletingColor] = useState<Color | null>(null)
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const t = useTranslations()

	const {
		data: colorsResponse,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['colors'],
		queryFn: getAllColors,
	})

	const colors = colorsResponse?.data || []

	const filteredColors = colors.filter(([name]) =>
		name.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	if (isLoading) {
		return (
			<div className='space-y-4'>
				<div className='flex items-center space-x-2'>
					<Search className='h-4 w-4' />
					<Input
						placeholder={t('colors.searchPlaceholder') || 'Search colors...'}
						disabled
						className='max-w-sm'
					/>
				</div>
				<div className='rounded-md border'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('colors.name') || 'Name'}</TableHead>
								<TableHead>{t('colors.color') || 'Color'}</TableHead>
								<TableHead>{t('colors.hexCode') || 'Hex Code'}</TableHead>
								<TableHead className='text-right'>
									{t('common.actions') || 'Actions'}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{[...Array(3)].map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<div className='h-4 w-24 animate-pulse rounded bg-muted' />
									</TableCell>
									<TableCell>
										<div className='h-6 w-6 animate-pulse rounded bg-muted' />
									</TableCell>
									<TableCell>
										<div className='h-4 w-16 animate-pulse rounded bg-muted' />
									</TableCell>
									<TableCell className='text-right'>
										<div className='flex justify-end space-x-2'>
											<div className='h-8 w-8 animate-pulse rounded bg-muted' />
											<div className='h-8 w-8 animate-pulse rounded bg-muted' />
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='py-4 text-center'>
				<p className='text-muted-foreground'>
					{t('colors.errorLoading') || 'Error loading colors'}
				</p>
			</div>
		)
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center space-x-2'>
				<Search className='h-4 w-4' />
				<Input
					placeholder={t('colors.searchPlaceholder') || 'Search colors...'}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='max-w-sm'
				/>
			</div>

			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('colors.name') || 'Name'}</TableHead>
							<TableHead>{t('colors.color') || 'Color'}</TableHead>
							<TableHead>{t('colors.hexCode') || 'Hex Code'}</TableHead>
							<TableHead className='text-right'>
								{t('common.actions') || 'Actions'}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredColors.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className='py-4 text-center'>
									<p className='text-muted-foreground'>
										{searchTerm
											? t('colors.noResultsFound') ||
												'No colors found matching your search'
											: t('colors.noColors') || 'No colors available'}
									</p>
								</TableCell>
							</TableRow>
						) : (
							filteredColors.map(([name, hexCode], index) => (
								<TableRow key={`${name}-${index}`}>
									<TableCell className='font-medium'>{name}</TableCell>
									<TableCell>
										<div
											className='h-6 w-6 rounded border border-gray-300'
											style={{ backgroundColor: hexCode }}
											title={hexCode}
										/>
									</TableCell>
									<TableCell>
										<Badge variant='secondary' className='font-mono'>
											{hexCode}
										</Badge>
									</TableCell>
									<TableCell className='text-right'>
										<div className='flex justify-end space-x-2'>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => setEditingColor([name, hexCode])}>
												<Edit className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => setDeletingColor([name, hexCode])}>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{editingColor && (
				<EditColorModal
					color={editingColor}
					isOpen={!!editingColor}
					onClose={() => setEditingColor(null)}
				/>
			)}

			{deletingColor && (
				<DeleteColorDialog
					color={deletingColor}
					isOpen={!!deletingColor}
					onClose={() => setDeletingColor(null)}
				/>
			)}
		</div>
	)
}
