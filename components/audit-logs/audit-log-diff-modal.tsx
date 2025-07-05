"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AuditLog } from "@/lib/api/audit-logs"

interface AuditLogDiffModalProps {
  log: AuditLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
  dictionary: any
}

export function AuditLogDiffModal({ log, open, onOpenChange, dictionary }: AuditLogDiffModalProps) {
  if (!log) return null

  const formatJson = (obj: any) => {
    if (!obj || Object.keys(obj).length === 0) {
      return null
    }
    return JSON.stringify(obj, null, 2)
  }

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

  const beforeJson = formatJson(log.beforeValue)
  const afterJson = formatJson(log.afterValue)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {dictionary?.auditLogs?.diffModal?.title || "Audit Log Details"}
            <Badge className={getOperationColor(log.operation)}>
              {dictionary?.auditLogs?.operations?.[log.operation] || log.operation}
            </Badge>
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{dictionary?.auditLogs?.diffModal?.recordId || "Record ID"}:</span>
            {log.recordId} •<span className="font-medium">{dictionary?.auditLogs?.table || "Table"}:</span>
            {dictionary?.auditLogs?.tables?.[log.tableName] || log.tableName}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 h-[60vh]">
          <div className="space-y-2">
            <h3 className="font-medium text-sm">{dictionary?.auditLogs?.diffModal?.beforeValue || "Before"}</h3>
            <div className="border rounded-md p-3 h-full overflow-auto bg-muted/50">
              {beforeJson ? (
                <pre className="text-xs whitespace-pre-wrap font-mono">{beforeJson}</pre>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  {dictionary?.auditLogs?.diffModal?.noDataBefore || "No data (new record)"}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm">{dictionary?.auditLogs?.diffModal?.afterValue || "After"}</h3>
            <div className="border rounded-md p-3 h-full overflow-auto bg-muted/50">
              {afterJson ? (
                <pre className="text-xs whitespace-pre-wrap font-mono">{afterJson}</pre>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  {dictionary?.auditLogs?.diffModal?.noDataAfter || "No data (deleted record)"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {dictionary?.auditLogs?.diffModal?.close || "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
