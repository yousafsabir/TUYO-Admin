"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuditLogs, type AuditLog, type AuditLogFilters } from "@/lib/api/audit-logs"
import { AuditLogDiffModal } from "./audit-log-diff-modal"

interface AuditLogsTableProps {
  filters: AuditLogFilters
  onFiltersChange: (filters: AuditLogFilters) => void
  dictionary: any
}

export function AuditLogsTable({ filters, onFiltersChange, dictionary }: AuditLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [diffModalOpen, setDiffModalOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ["audit-logs", "filtered", filters],
    queryFn: () => getAuditLogs(filters),
    staleTime: 0,
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

  const handlePageChange = (newPage: number) => {
    onFiltersChange({ ...filters, page: newPage })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            {dictionary?.auditLogs?.loadingLogs || "Loading audit logs..."}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-sm text-red-600">{dictionary?.common?.error || "Error"}: Failed to load audit logs</p>
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
            {dictionary?.auditLogs?.title || "Audit Logs"}
            {pagination && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({pagination.total} {dictionary?.common?.total || "total"})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                {dictionary?.auditLogs?.noLogs || "No audit logs found with the current filters."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dictionary?.auditLogs?.admin || "Admin"}</TableHead>
                      <TableHead>{dictionary?.auditLogs?.table || "Table"}</TableHead>
                      <TableHead>{dictionary?.auditLogs?.operation || "Operation"}</TableHead>
                      <TableHead>{dictionary?.auditLogs?.recordId || "Record ID"}</TableHead>
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
                          <span className="font-medium">
                            {dictionary?.auditLogs?.tables?.[log.tableName] || log.tableName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getOperationColor(log.operation)}>
                            {dictionary?.auditLogs?.operations?.[log.operation] || log.operation}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{log.recordId}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{format(new Date(log.createdAt), "MMM dd, yyyy")}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(log.createdAt), "HH:mm:ss")}
                          </div>
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
              {pagination && pagination.total > pagination.limit && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    {dictionary?.common?.showing || "Showing"} {(pagination.page - 1) * pagination.limit + 1}{" "}
                    {dictionary?.common?.to || "to"} {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                    {dictionary?.common?.of || "of"} {pagination.total} {dictionary?.common?.results || "results"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {dictionary?.common?.previous || "Previous"}
                    </Button>
                    <span className="text-sm">
                      {dictionary?.common?.page || "Page"} {pagination.page} {dictionary?.common?.of || "of"}{" "}
                      {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                    >
                      {dictionary?.common?.next || "Next"}
                      <ChevronRight className="h-4 w-4" />
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
        dictionary={dictionary}
      />
    </>
  )
}
