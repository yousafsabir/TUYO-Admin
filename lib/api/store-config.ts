import { fetchWithNgrok } from './fetch-utils'

interface DbTablesResponse {
	statusCode: number
	status: string
	message: string
	data: string[]
}

export async function getDbTables(): Promise<DbTablesResponse> {
	const response = await fetchWithNgrok(`/store-config/db-tables`, {
		method: 'GET',
	})

	if (!response.ok) {
		throw new Error('Failed to fetch database tables')
	}

	return response.json()
}
