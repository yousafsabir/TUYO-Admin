'use client'

import { useState } from 'react'
import { AuditLogsFilters } from '@/components/audit-logs/audit-logs-filters'
import { AuditLogsTable } from '@/components/audit-logs/audit-logs-table'
import type { AuditLogFilters } from '@/lib/api/audit-logs'

interface AuditLogsPageProps {
	params: { lang: string }
}

export default function AuditLogsPage({ params }: AuditLogsPageProps) {
	const [filters, setFilters] = useState<AuditLogFilters>({
		page: 1,
		limit: 25,
	})

	// You'll need to get the dictionary based on the language
	// For now, I'll use a placeholder - you can integrate with your i18n system
	const dictionary = {
		auditLogs: {
			title: 'Audit Logs',
			filters: 'Filters',
			admin: 'Admin',
			table: 'Table',
			operation: 'Operation',
			timeFrame: 'Time Frame',
			recordId: 'Record ID',
			executedAt: 'Executed At',
			actions: 'Actions',
			showDiff: 'Show Diff',
			loadingLogs: 'Loading audit logs...',
			noLogs: 'No audit logs found with the current filters.',
			selectAdmin: 'Select admin',
			selectTable: 'Select table',
			selectOperation: 'Select operation',
			selectTimeFrame: 'Select time frame',
			operations: {
				CREATE: 'Create',
				UPDATE: 'Update',
				DELETE: 'Delete',
			},
			timeFrames: {
				today: 'Today',
				yesterday: 'Yesterday',
				'last-week': 'Last Week',
				'last-month': 'Last Month',
			},
			tables: {
				// Add table name translations here if needed
			},
		},
		common: {
			all: 'All',
			clear: 'Clear',
			expand: 'Expand',
			collapse: 'Collapse',
			error: 'Error',
			showing: 'Showing',
			to: 'to',
			of: 'of',
			results: 'results',
			page: 'Page',
			previous: 'Previous',
			next: 'Next',
			total: 'total',
		},
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold tracking-tight'>{dictionary.auditLogs.title}</h1>
				<p className='text-muted-foreground'>
					View and filter all administrative actions performed in the system.
				</p>
			</div>

			<AuditLogsFilters filters={filters} onFiltersChange={setFilters} />

			<AuditLogsTable filters={filters} onFiltersChange={setFilters} />
		</div>
	)
}
