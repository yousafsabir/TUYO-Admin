"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getAllOrders, type Order } from "@/lib/api/orders"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OrdersTableProps {
  dictionary: any
}

export function OrdersTable({ dictionary }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 25

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["orders", currentPage],
    queryFn: () => getAllOrders({ page: currentPage, limit }),
  })

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return "N/A"
    return `$${(amount / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "placed":
        return "default"
      case "processing":
        return "secondary"
      case "shipped":
        return "outline"
      case "delivered":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      case "refunded":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>{error instanceof Error ? error.message : "Failed to load orders"}</AlertDescription>
      </Alert>
    )
  }

  const orders = data?.data?.orders || []
  const pagination = data?.data?.pagination

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dictionary?.orders?.orderId || "Order ID"}</TableHead>
              <TableHead>{dictionary?.orders?.buyerId || "Buyer ID"}</TableHead>
              <TableHead>{dictionary?.orders?.total || "Total"}</TableHead>
              <TableHead>{dictionary?.orders?.status || "Status"}</TableHead>
              <TableHead>{dictionary?.orders?.paymentStatus || "Payment"}</TableHead>
              <TableHead>{dictionary?.orders?.shippingCost || "Shipping"}</TableHead>
              <TableHead>{dictionary?.orders?.platformFee || "Platform Fee"}</TableHead>
              <TableHead>{dictionary?.orders?.createdAt || "Created"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {dictionary?.orders?.noOrders || "No orders found"}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: Order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.stripeCheckoutSessionId?.substring(0, 20)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.buyerId}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status || "Unknown"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                      {order.paymentStatus || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(order.shippingCost)}</TableCell>
                  <TableCell>{formatCurrency(order.platformFee)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{formatDate(order.createdAt)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.updatedAt)}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {dictionary?.orders?.showing || "Showing"} {orders.length} {dictionary?.orders?.of || "of"}{" "}
            {pagination.total} {dictionary?.orders?.orders || "orders"}
          </p>
          <p className="text-sm text-muted-foreground">
            {dictionary?.orders?.page || "Page"} {pagination.page} {dictionary?.orders?.of || "of"}{" "}
            {Math.ceil(pagination.total / pagination.limit)}
          </p>
        </div>
      )}
    </div>
  )
}
