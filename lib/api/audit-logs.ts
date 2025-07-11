import { fetchWithNgrok, createAuthHeaders } from './fetch-utils'

export interface AuditLog {
	id: number
	tableName: string
	recordId: number
	operation: 'CREATE' | 'UPDATE' | 'DELETE'
	beforeValue: Record<string, any>
	afterValue: Record<string, any>
	createdAt: string
	admin: {
		email: string
		name: string
	}
}

interface AuditLogsResponse {
	statusCode: number
	status: string
	message: string
	data: {
		logs: AuditLog[]
		pagination: {
			page: number
			limit: number
			total: number
		}
	}
}

export type AuditLogOperation = 'CREATE' | 'UPDATE' | 'DELETE'
export type AuditLogTimeFrame = 'today' | 'yesterday' | 'last-week' | 'last-month'

export interface AuditLogFilters {
	page?: number
	limit?: number
	adminId?: number
	tableName?: string
	operation?: AuditLogOperation
	timeFrame?: AuditLogTimeFrame
}

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogsResponse> {
	const { page = 1, limit = 25, adminId, tableName, operation, timeFrame } = filters

	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	})

	if (adminId) params.append('adminId', adminId.toString())
	if (tableName) params.append('tableName', tableName)
	if (operation) params.append('operation', operation)
	if (timeFrame) params.append('timeFrame', timeFrame)

	const response = await fetchWithNgrok(`/admins/audit-logs?${params.toString()}`, {
		method: 'GET',
		headers: createAuthHeaders(),
	})

	if (!response.ok) {
		throw new Error('Failed to fetch audit logs')
	}

	return response.json()
}

// Keep the old function for backward compatibility with recent activity table
async function getRecentAuditLogs(page = 1, limit = 10): Promise<AuditLogsResponse> {
	return getAuditLogs({ page, limit })
}
