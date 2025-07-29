'use client'

import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { getAllUsers, toggleUserInfluencerStatus, type User } from '@/lib/api/users'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/use-toast'
import { imageUrl } from '@/lib/utils'

interface UsersTableProps {}

export function UsersTable({}: UsersTableProps) {
	const [page, setPage] = useState(1)
	const [limit] = useState(10)
	const [searchQuery, setSearchQuery] = useState('')
	const [currentQuery, setCurrentQuery] = useState('')
	const queryClient = useQueryClient()
	const t = useTranslations()

	// Track which users are being updated
	const [updatingUsers, setUpdatingUsers] = useState<Record<number, boolean>>({})
	// Track avatar loading errors
	const [avatarErrors, setAvatarErrors] = useState<Record<number, boolean>>({})

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['users', page, limit, currentQuery],
		queryFn: () => getAllUsers(page, limit, currentQuery),
	})

	const { mutate: toggleInfluencerStatus } = useMutation({
		mutationFn: (userId: number) => toggleUserInfluencerStatus(userId),
		onMutate: (userId) => {
			// Set updating state for this user
			setUpdatingUsers((prev) => ({ ...prev, [userId]: true }))
		},
		onSuccess: (response) => {
			// Invalidate the users query to refresh the list
			queryClient.invalidateQueries({ queryKey: ['users'] })

			// Show success toast
			toast({
				title: t('users.statusUpdated') || 'Status Updated',
				description:
					t('users.influencerStatusUpdated') ||
					'User influencer status has been updated.',
			})
		},
		onError: (error) => {
			// Show error toast
			toast({
				variant: 'destructive',
				title: t('common.error') || 'Error',
				description:
					error instanceof Error
						? error.message
						: t('users.failedToUpdateStatus') || 'Failed to update influencer status.',
			})
		},
		onSettled: (_, __, userId) => {
			// Clear updating state for this user
			setUpdatingUsers((prev) => {
				const newState = { ...prev }
				delete newState[userId]
				return newState
			})
		},
	})

	const handlePreviousPage = () => {
		setPage((prev) => Math.max(prev - 1, 1))
	}

	const handleNextPage = () => {
		if (data?.data?.pagination && page < Math.ceil(data.data.pagination.total / limit)) {
			setPage((prev) => prev + 1)
		}
	}

	const handleInfluencerToggle = (userId: number) => {
		toggleInfluencerStatus(userId)
	}

	const handleSearch = (e: FormEvent) => {
		e.preventDefault()
		setCurrentQuery(searchQuery)
		setPage(1) // Reset to first page when searching
	}

	const handleAvatarError = (userId: number) => {
		setAvatarErrors((prev) => ({ ...prev, [userId]: true }))
	}

	return (
		<div className='space-y-4'>
			{/* Search Form */}
			<form onSubmit={handleSearch} className='flex gap-2'>
				<div className='relative flex-1'>
					<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
					<Input
						type='text'
						placeholder={t('users.searchPlaceholder') || 'Search users...'}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-8'
					/>
				</div>
				<Button type='submit' disabled={isLoading}>
					{t('common.search') || 'Search'}
				</Button>
			</form>

			{isLoading ? (
				<div className='flex justify-center py-8'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			) : isError ? (
				<Alert variant='destructive' className='my-4'>
					<AlertDescription>
						{error instanceof Error ? error.message : 'Failed to load users'}
					</AlertDescription>
				</Alert>
			) : (
				<>
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('users.user') || 'User'}</TableHead>
									<TableHead>{t('users.username') || 'Username'}</TableHead>
									<TableHead>{t('users.email') || 'Email'}</TableHead>
									<TableHead className='text-center'>
										{t('users.influencer') || 'Influencer'}
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data?.data?.users.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={4}
											className='py-8 text-center text-muted-foreground'>
											{currentQuery
												? t('users.noSearchResults') ||
													'No users found matching your search'
												: t('users.noUsers') || 'No users found'}
										</TableCell>
									</TableRow>
								) : (
									data?.data?.users.map((user: User) => (
										<TableRow key={user.id}>
											<TableCell>
												<Link href={'/dashboard/users/' + user.id}>
													<div className='flex items-center gap-3'>
														<Avatar>
															{!avatarErrors[user.id] ? (
																<AvatarImage
																	src={
																		imageUrl(user.avatarUrl) ||
																		'/placeholder.svg'
																	}
																	alt={`${user.firstName} ${user.lastName}`}
																	onError={() =>
																		handleAvatarError(user.id)
																	}
																	className='object-cover object-top'
																/>
															) : null}
															<AvatarFallback>
																{user.firstName.charAt(0)}
																{user.lastName.charAt(0)}
															</AvatarFallback>
														</Avatar>
														<div>
															<p className='font-medium'>
																{user.firstName} {user.lastName}
															</p>
															<p className='text-xs text-muted-foreground'>
																ID: {user.id}
															</p>
														</div>
													</div>
												</Link>
											</TableCell>
											<TableCell>{user.username}</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell className='text-center'>
												<div className='flex justify-center'>
													{updatingUsers[user.id] ? (
														<Loader2 className='h-4 w-4 animate-spin' />
													) : (
														<Switch
															checked={user.isInfluencer}
															onCheckedChange={() =>
																handleInfluencerToggle(user.id)
															}
														/>
													)}
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{data && data.data && data.data.users.length > 0 && (
						<div className='flex items-center justify-between'>
							<div className='text-sm text-muted-foreground'>
								{t('pagination.showing') || 'Showing'} {(page - 1) * limit + 1}{' '}
								{t('pagination.to') || 'to'}{' '}
								{Math.min(page * limit, data?.data?.pagination?.total || 0)}{' '}
								{t('pagination.of') || 'of'} {data?.data?.pagination?.total || 0}{' '}
								{t('users.itemsName') || 'users'}
								{currentQuery && (
									<span className='ml-1'>
										{t('users.forSearch') || 'for search'} "{currentQuery}"
									</span>
								)}
							</div>
							<div className='flex items-center space-x-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={handlePreviousPage}
									disabled={page <= 1}>
									<ChevronLeft className='mr-1 h-4 w-4' />
									{t('pagination.prev') || 'Previous'}
								</Button>
								<div className='text-sm'>
									{t('pagination.page') || 'Page'} {page}{' '}
									{t('pagination.of') || 'of'}{' '}
									{data?.data?.pagination?.total
										? Math.ceil(data?.data?.pagination?.total / limit)
										: 0}
								</div>
								<Button
									variant='outline'
									size='sm'
									onClick={handleNextPage}
									disabled={
										page >= Math.ceil(data.data.pagination.total / limit)
									}>
									{t('pagination.next') || 'Next'}
									<ChevronRight className='ml-1 h-4 w-4' />
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	)
}
