'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStats } from './dashboard-stats'
import { RecentActivityTable } from '@/components/audit-logs/recent-activity-table'
import { useTranslations } from 'next-intl'

export default function DashboardPage() {
	const t = useTranslations()

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-3xl font-bold tracking-tight'>{t('dashboard.title')}</h2>
				<p className='text-muted-foreground'>{t('dashboard.welcome')}</p>
			</div>

			<DashboardStats />

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				<Card className='col-span-full'>
					<CardHeader>
						<CardTitle>{t('dashboard.recentActivity')}</CardTitle>
						<CardDescription>{t('dashboard.latestActions')}</CardDescription>
					</CardHeader>
					<CardContent>
						<RecentActivityTable />
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
