'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { AuditLog } from '@/lib/api/audit-logs'
import { useTranslations } from 'next-intl'

interface AuditLogDiffModalProps {
	log: AuditLog | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function AuditLogDiffModal({ log, open, onOpenChange }: AuditLogDiffModalProps) {
	if (!log) return null

	const t = useTranslations()

	const formatJson = (obj: any) => {
		if (!obj || Object.keys(obj).length === 0) {
			return null
		}
		return JSON.stringify(obj, null, 2)
	}

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

	const beforeJson = formatJson(log.beforeValue)
	const afterJson = formatJson(log.afterValue)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-h-[80vh] max-w-6xl overflow-hidden'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						{t('auditLogs.diffModal.title') || 'Audit Log Details'}
						<Badge className={getOperationColor(log.operation)}>
							{t(`auditLogs.operations.${log.operation}`) || log.operation}
						</Badge>
					</DialogTitle>
					<div className='text-sm text-muted-foreground'>
						<span className='font-medium'>
							{t('auditLogs.diffModal.recordId') || 'Record ID'}:
						</span>
						{log.recordId} •
						<span className='font-medium'>{t('auditLogs.table') || 'Table'}:</span>
						{t(`auditLogs.tables.${log.tableName}` as any) || log.tableName}
					</div>
				</DialogHeader>

				<div className='grid h-[60vh] grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<h3 className='text-sm font-medium'>
							{t('auditLogs.diffModal.beforeValue') || 'Before'}
						</h3>
						<div className='h-full overflow-auto rounded-md border bg-muted/50 p-3'>
							{beforeJson ? (
								<pre className='whitespace-pre-wrap font-mono text-xs'>
									{beforeJson}
								</pre>
							) : (
								<div className='text-sm italic text-muted-foreground'>
									{t('auditLogs.diffModal.noDataBefore') ||
										'No data (new record)'}
								</div>
							)}
						</div>
					</div>

					<div className='space-y-2'>
						<h3 className='text-sm font-medium'>
							{t('auditLogs.diffModal.afterValue') || 'After'}
						</h3>
						<div className='h-full overflow-auto rounded-md border bg-muted/50 p-3'>
							{afterJson ? (
								<pre className='whitespace-pre-wrap font-mono text-xs'>
									{afterJson}
								</pre>
							) : (
								<div className='text-sm italic text-muted-foreground'>
									{t('auditLogs.diffModal.noDataAfter') ||
										'No data (deleted record)'}
								</div>
							)}
						</div>
					</div>
				</div>

				<div className='flex justify-end'>
					<Button variant='outline' onClick={() => onOpenChange(false)}>
						{t('common.close') || 'Close'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
