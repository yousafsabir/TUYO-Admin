"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAuditLogs, type AuditLog, type AuditLogFilters } from "@/lib/api/audit-logs"
import { AuditLogDiffModal } from "./audit-log-diff-modal"
import { AuditLogsFilters } from "./audit-logs-filters"

interface RecentActivityTableProps {
  dictionary: any
}

export function RecentActivityTable({ dictionary }: RecentActivityTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [diffModalOpen, setDiffModalOpen] = useState(false)
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 25,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => getAuditLogs(filters),
    staleTime: 0, // Override global staleTime for audit logs - we want fresh data
  })

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case "CREATE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "UPDATE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleShowDiff = (log: AuditLog) => {
    setSelectedLog(log)
    setDiffModalOpen(true)
  }

  const handleFiltersChange = (newFilters: AuditLogFilters) => {
    setFilters(newFilters)
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <AuditLogsFilters filters={filters} onFiltersChange={handleFiltersChange} dictionary={dictionary} />
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            {dictionary?.auditLogs?.loadingLogs || "Loading audit logs..."}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <AuditLogsFilters filters={filters} onFiltersChange={handleFiltersChange} dictionary={dictionary} />
        <div className="text-center py-4">
          <p className="text-sm text-red-600">{dictionary?.common?.error || "Error"}: Failed to load audit logs</p>
        </div>
      </div>
    )
  }

  if (!data?.data?.logs?.length) {
    return (
      <div className="space-y-4">
        <AuditLogsFilters filters={filters} onFiltersChange={handleFiltersChange} dictionary={dictionary} />
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            {dictionary?.auditLogs?.noLogs || "No audit logs to display."}
          </p>
        </div>
      </div>
    )
  }

  const { logs, pagination } = data.data

  return (
    <div className="space-y-4">
      <AuditLogsFilters filters={filters} onFiltersChange={handleFiltersChange} dictionary={dictionary} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dictionary?.auditLogs?.admin || "Admin"}</TableHead>
              <TableHead>{dictionary?.auditLogs?.table || "Table"}</TableHead>
              <TableHead>{dictionary?.auditLogs?.recordId || "Record ID"}</TableHead>
              <TableHead>{dictionary?.auditLogs?.operation || "Operation"}</TableHead>
              <TableHead>{dictionary?.auditLogs?.executedAt || "Executed At"}</TableHead>
              <TableHead>{dictionary?.auditLogs?.actions || "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{log.admin.name}</div>
                    <div className="text-sm text-muted-foreground">{log.admin.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{dictionary?.auditLogs?.tables?.[log.tableName] || log.tableName}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{log.recordId}</span>
                </TableCell>
                <TableCell>
                  <Badge className={getOperationColor(log.operation)}>
                    {dictionary?.auditLogs?.operations?.[log.operation] || log.operation}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{format(new Date(log.createdAt), "MMM dd, yyyy")}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(log.createdAt), "HH:mm:ss")}</div>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleShowDiff(log)} className="h-8">
                    <Eye className="h-3 w-3 mr-1" />
                    {dictionary?.auditLogs?.showDiff || "Show Diff"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {dictionary?.common?.showing || "Showing"} {(pagination.page - 1) * pagination.limit + 1}{" "}
            {dictionary?.common?.to || "to"} {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
            {dictionary?.common?.of || "of"} {pagination.total} {dictionary?.auditLogs?.entries || "entries"}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              {dictionary?.common?.previous || "Previous"}
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
                const pageNum = pagination.page - 2 + i
                if (pageNum < 1 || pageNum > Math.ceil(pagination.total / pagination.limit)) return null
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            >
              {dictionary?.common?.next || "Next"}
            </Button>
          </div>
        </div>
      )}

      <AuditLogDiffModal
        log={selectedLog}
        open={diffModalOpen}
        onOpenChange={setDiffModalOpen}
        dictionary={dictionary}
      />
    </div>
  )
}
