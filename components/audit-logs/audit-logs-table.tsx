'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuditLogs, type AuditLog, type AuditLogFilters } from '@/lib/api/audit-logs'
import { AuditLogDiffModal } from './audit-log-diff-modal'

interface AuditLogsTableProps {
	filters: AuditLogFilters
	onFiltersChange: (filters: AuditLogFilters) => void
}

export function AuditLogsTable({ filters, onFiltersChange }: AuditLogsTableProps) {
	const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
	const [diffModalOpen, setDiffModalOpen] = useState(false)
	const t = useTranslations()

	const { data, isLoading, error } = useQuery({
		queryKey: ['audit-logs', 'filtered', filters],
		queryFn: () => getAuditLogs(filters),
		staleTime: 0,
	})

	const getOperationColor = (operation: string) => {
		switch (operation) {
			case 'CREATE':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
			case 'UPDATE':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
			case 'DELETE':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
		}
	}

	const handleShowDiff = (log: AuditLog) => {
		setSelectedLog(log)
		setDiffModalOpen(true)
	}

	const handlePageChange = (newPage: number) => {
		onFiltersChange({ ...filters, page: newPage })
	}

	if (isLoading) {
		return (
			<Card>
				<CardContent className='py-8 text-center'>
					<p className='text-sm text-muted-foreground'>
						{t('auditLogs.loadingLogs') || 'Loading audit logs...'}
					</p>
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<Card>
				<CardContent className='py-8 text-center'>
					<p className='text-sm text-red-600'>
						{t('common.error') || 'Error'}: Failed to load audit logs
					</p>
				</CardContent>
			</Card>
		)
	}

	const logs = data?.data?.logs || []
	const pagination = data?.data?.pagination

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>
						{t('auditLogs.heading') || 'Audit Logs'}
						{pagination && (
							<span className='ml-2 text-sm font-normal text-muted-foreground'>
								({pagination.total} {t('pagination.total') || 'total'})
							</span>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{logs.length === 0 ? (
						<div className='py-8 text-center'>
							<p className='text-sm text-muted-foreground'>
								{t('auditLogs.noLogs') ||
									'No audit logs found with the current filters.'}
							</p>
						</div>
					) : (
						<>
							<div className='rounded-md border'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>{t('auditLogs.admin') || 'Admin'}</TableHead>
											<TableHead>{t('auditLogs.table') || 'Table'}</TableHead>
											<TableHead>
												{t('auditLogs.operation') || 'Operation'}
											</TableHead>
											<TableHead>
												{t('auditLogs.recordId') || 'Record ID'}
											</TableHead>
											<TableHead>
												{t('auditLogs.executedAt') || 'Executed At'}
											</TableHead>
											<TableHead>
												{t('auditLogs.actions') || 'Actions'}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{logs.map((log) => (
											<TableRow key={log.id}>
												<TableCell>
													<div>
														<div className='font-medium'>
															{log.admin.name}
														</div>
														<div className='text-sm text-muted-foreground'>
															{log.admin.email}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<span className='font-medium'>
														{t(
															`auditLogs.tables.${log.tableName}` as any,
															{
																default: log.tableName,
															},
														)}
													</span>
												</TableCell>
												<TableCell>
													<Badge
														className={getOperationColor(
															log.operation,
														)}>
														{t(
															`auditLogs.operations.${log.operation}`,
														) || log.operation}
													</Badge>
												</TableCell>
												<TableCell>
													<span className='font-mono text-sm'>
														{log.recordId}
													</span>
												</TableCell>
												<TableCell>
													<div className='text-sm'>
														{format(
															new Date(log.createdAt),
															'MMM dd, yyyy',
														)}
													</div>
													<div className='text-xs text-muted-foreground'>
														{format(
															new Date(log.createdAt),
															'HH:mm:ss',
														)}
													</div>
												</TableCell>
												<TableCell>
													<Button
														variant='outline'
														size='sm'
														onClick={() => handleShowDiff(log)}
														className='h-8'>
														<Eye className='mr-1 h-3 w-3' />
														{t('auditLogs.showDiff') || 'Show Diff'}
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Pagination */}
							{pagination && pagination.total > pagination.limit && (
								<div className='mt-4 flex items-center justify-between'>
									<div className='text-sm text-muted-foreground'>
										{t('pagination.showing') || 'Showing'}{' '}
										{(pagination.page - 1) * pagination.limit + 1}{' '}
										{t('pagination.to') || 'to'}{' '}
										{Math.min(
											pagination.page * pagination.limit,
											pagination.total,
										)}{' '}
										{t('pagination.of') || 'of'} {pagination.total}{' '}
										{t('auditLogs.itemsName') || 'results'}
									</div>
									<div className='flex items-center gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => handlePageChange(pagination.page - 1)}
											disabled={pagination.page <= 1}>
											<ChevronLeft className='h-4 w-4' />
											{t('pagination.prev') || 'Previous'}
										</Button>
										<span className='text-sm'>
											{t('pagination.page') || 'Page'} {pagination.page}{' '}
											{t('pagination.of') || 'of'}{' '}
											{Math.ceil(pagination.total / pagination.limit)}
										</span>
										<Button
											variant='outline'
											size='sm'
											onClick={() => handlePageChange(pagination.page + 1)}
											disabled={
												pagination.page >=
												Math.ceil(pagination.total / pagination.limit)
											}>
											{t('pagination.next') || 'Next'}
											<ChevronRight className='h-4 w-4' />
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			<AuditLogDiffModal
				log={selectedLog}
				open={diffModalOpen}
				onOpenChange={setDiffModalOpen}
			/>
		</>
	)
}
