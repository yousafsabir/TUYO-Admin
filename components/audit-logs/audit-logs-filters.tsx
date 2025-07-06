'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Filter } from 'lucide-react'
import { getDbTables } from '@/lib/api/store-config'
import { getAllAdmins } from '@/lib/api/auth'
import type { AuditLogFilters, AuditLogOperation, AuditLogTimeFrame } from '@/lib/api/audit-logs'
import { useTranslations } from 'next-intl'

interface AuditLogsFiltersProps {
	filters: AuditLogFilters
	onFiltersChange: (filters: AuditLogFilters) => void
}

export function AuditLogsFilters({ filters, onFiltersChange }: AuditLogsFiltersProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	const t = useTranslations()

	// Fetch admins for the admin filter
	const { data: adminsData } = useQuery({
		queryKey: ['admins'],
		queryFn: () => getAllAdmins(1, 100), // Get first 100 admins
	})

	// Fetch database tables for the table filter
	const { data: tablesData } = useQuery({
		queryKey: ['db-tables'],
		queryFn: getDbTables,
	})

	const operations: { value: AuditLogOperation; label: string }[] = [
		{
			value: 'CREATE',
			label: t('auditLogs.operations.CREATE') || 'Create',
		},
		{
			value: 'UPDATE',
			label: t('auditLogs.operations.UPDATE') || 'Update',
		},
		{
			value: 'DELETE',
			label: t('auditLogs.operations.DELETE') || 'Delete',
		},
	]

	const timeFrames: { value: AuditLogTimeFrame; label: string }[] = [
		{
			value: 'today',
			label: t('auditLogs.timeFrames.today') || 'Today',
		},
		{
			value: 'yesterday',
			label: t('auditLogs.timeFrames.yesterday') || 'Yesterday',
		},
		{
			value: 'last-week',
			label: t('auditLogs.timeFrames.last-week') || 'Last Week',
		},
		{
			value: 'last-month',
			label: t('auditLogs.timeFrames.last-month') || 'Last Month',
		},
	]

	const updateFilter = (key: keyof AuditLogFilters, value: any) => {
		onFiltersChange({
			...filters,
			[key]: value || undefined,
			page: 1, // Reset to first page when filters change
		})
	}

	const clearFilters = () => {
		onFiltersChange({ page: 1, limit: filters.limit })
	}

	const hasActiveFilters = !!(
		filters.adminId ||
		filters.tableName ||
		filters.operation ||
		filters.timeFrame
	)

	return (
		<Card>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<Filter className='h-4 w-4' />
						{t('common.filters') || 'Filters'}
					</CardTitle>
					<div className='flex items-center gap-2'>
						{hasActiveFilters && (
							<Button variant='outline' size='sm' onClick={clearFilters}>
								<X className='mr-1 h-3 w-3' />
								{t('common.clear') || 'Clear'}
							</Button>
						)}
						<Button
							variant='ghost'
							size='sm'
							onClick={() => setIsExpanded(!isExpanded)}>
							{isExpanded
								? t('common.collapse') || 'Collapse'
								: t('common.expand') || 'Expand'}
						</Button>
					</div>
				</div>
			</CardHeader>

			{isExpanded && (
				<CardContent className='pt-0'>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
						{/* Admin Filter */}
						<div className='space-y-2'>
							<label className='text-sm font-medium'>
								{t('auditLogs.admin') || 'Admin'}
							</label>
							<Select
								value={filters.adminId?.toString() || 'all'}
								onValueChange={(value) =>
									updateFilter(
										'adminId',
										value === 'all' ? undefined : Number.parseInt(value),
									)
								}>
								<SelectTrigger>
									<SelectValue
										placeholder={t('auditLogs.selectAdmin') || 'Select admin'}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>{t('common.all') || 'All'}</SelectItem>
									{adminsData?.data?.admins?.map((admin) => (
										<SelectItem key={admin.id} value={admin.id.toString()}>
											{admin.name} ({admin.email})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Table Filter */}
						<div className='space-y-2'>
							<label className='text-sm font-medium'>
								{t('auditLogs.table') || 'Table'}
							</label>
							<Select
								value={filters.tableName || 'all'}
								onValueChange={(value) =>
									updateFilter('tableName', value === 'all' ? undefined : value)
								}>
								<SelectTrigger>
									<SelectValue
										placeholder={t('auditLogs.selectTable') || 'Select table'}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>{t('common.all') || 'All'}</SelectItem>
									{tablesData?.data?.map((table) => (
										<SelectItem key={table} value={table}>
											{t(`auditLogs.tables.${table}` as any) || table}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Operation Filter */}
						<div className='space-y-2'>
							<label className='text-sm font-medium'>
								{t('auditLogs.operation') || 'Operation'}
							</label>
							<Select
								value={filters.operation || 'all'}
								onValueChange={(value) =>
									updateFilter('operation', value === 'all' ? undefined : value)
								}>
								<SelectTrigger>
									<SelectValue
										placeholder={
											t('auditLogs.selectOperation') || 'Select operation'
										}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>{t('common.all') || 'All'}</SelectItem>
									{operations.map((op) => (
										<SelectItem key={op.value} value={op.value}>
											{op.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Time Frame Filter */}
						<div className='space-y-2'>
							<label className='text-sm font-medium'>
								{t('auditLogs.timeFrame') || 'Time Frame'}
							</label>
							<Select
								value={filters.timeFrame || 'all-time'}
								onValueChange={(value) =>
									updateFilter(
										'timeFrame',
										value === 'all-time' ? undefined : value,
									)
								}>
								<SelectTrigger>
									<SelectValue
										placeholder={
											t('common.select') + ' ' + t('auditLogs.timeFrame')
										}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all-time'>
										{t('common.all') || 'All Time'}
									</SelectItem>
									{timeFrames.map((tf) => (
										<SelectItem key={tf.value} value={tf.value}>
											{tf.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			)}
		</Card>
	)
}
