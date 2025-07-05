import { API_BASE_URL } from "./config"
import { fetchWithNgrok, createAuthHeaders } from "./fetch-utils"

export interface DbTablesResponse {
  statusCode: number
  status: string
  message: string
  data: string[]
}

export async function getDbTables(): Promise<DbTablesResponse> {
  const response = await fetchWithNgrok(`${API_BASE_URL}/store-config/db-tables`, {
    method: "GET",
    headers: createAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch database tables")
  }

  return response.json()
}
