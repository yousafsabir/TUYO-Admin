'use client'

import { useQuery } from '@tanstack/react-query'
import { getServerStats } from '@/lib/api/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCog, Users, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'next-intl'

export function DashboardStats() {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['serverStats'],
		queryFn: getServerStats,
		staleTime: 5 * 60 * 1000, // 5 minutes
	})

	const t = useTranslations()

	if (isLoading) {
		return (
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							{t('dashboard.admins') || 'Admins'}
						</CardTitle>
						<UserCog className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='flex items-center'>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							<p className='text-xs text-muted-foreground'>
								{t('common.loading') || 'Loading...'}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							{t('dashboard.users') || 'Users'}
						</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='flex items-center'>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							<p className='text-xs text-muted-foreground'>
								{t('common.loading') || 'Loading...'}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (isError) {
		return (
			<Alert variant='destructive' className='my-4'>
				<AlertDescription>
					{error instanceof Error ? error.message : 'Failed to load server statistics'}
				</AlertDescription>
			</Alert>
		)
	}

	const stats = data?.data || { users: 0, admins: 0 }

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>
						{t('dashboard.admins') || 'Admins'}
					</CardTitle>
					<UserCog className='h-4 w-4 text-muted-foreground' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{stats.admins}</div>
					<p className='text-xs text-muted-foreground'>
						{t('dashboard.totalAdmins') || 'Total administrators in the system'}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>
						{t('dashboard.users') || 'Users'}
					</CardTitle>
					<Users className='h-4 w-4 text-muted-foreground' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{stats.users}</div>
					<p className='text-xs text-muted-foreground'>
						{t('dashboard.stats.totalUsers') || 'Total registered users'}
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
