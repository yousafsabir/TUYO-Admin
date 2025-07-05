"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { getAllProducts, type Product } from "@/lib/api/products"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Loader2, MoreHorizontal, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { imageUrl } from "@/lib/utils"
import { ProductActionsModal } from "./product-actions-modal"
import Link from "next/link"

interface ProductsTableProps {
  dictionary: any
  lang: string
}

export function ProductsTable({ dictionary, lang }: ProductsTableProps) {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", page, limit],
    queryFn: () => getAllProducts(page, limit),
  })

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    if (data?.data?.pagination && page < Math.ceil(data.data.pagination.total / limit)) {
      setPage((prev) => prev + 1)
    }
  }

  const handleImageError = (productId: number) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }))
  }

  const handleActionsClick = (product: Product) => {
    setSelectedProduct(product)
    setIsActionsModalOpen(true)
  }

  const handleCloseActionsModal = () => {
    setIsActionsModalOpen(false)
    setSelectedProduct(null)
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      live: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      sold: "bg-blue-100 text-blue-800",
    }

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    )
  }

  const getConditionBadge = (condition: string) => {
    const conditionColors = {
      new: "bg-green-100 text-green-800",
      like_new: "bg-blue-100 text-blue-800",
      good: "bg-yellow-100 text-yellow-800",
      fair: "bg-orange-100 text-orange-800",
      poor: "bg-red-100 text-red-800",
    }

    return (
      <Badge
        variant="outline"
        className={conditionColors[condition as keyof typeof conditionColors] || "bg-gray-100 text-gray-800"}
      >
        {condition.replace("_", " ")}
      </Badge>
    )
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
        <AlertDescription>{error instanceof Error ? error.message : "Failed to load products"}</AlertDescription>
      </Alert>
    )
  }

  const products = data?.data?.products || []
  const pagination = data?.data?.pagination || { page: 1, limit, total: 0 }
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="space-y-4">
      {/* Add Product Button */}
      <div className="flex justify-end">
        <Link href={`/${lang}/dashboard/products/add`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {dictionary?.products?.addProduct || "Add Product"}
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dictionary?.products?.product || "Product"}</TableHead>
              <TableHead>{dictionary?.products?.seller || "Seller"}</TableHead>
              <TableHead>{dictionary?.products?.category || "Category"}</TableHead>
              <TableHead>{dictionary?.products?.price || "Price"}</TableHead>
              <TableHead>{dictionary?.products?.condition || "Condition"}</TableHead>
              <TableHead>{dictionary?.products?.status || "Status"}</TableHead>
              <TableHead>{dictionary?.products?.premium || "Premium"}</TableHead>
              <TableHead>{dictionary?.products?.createdAt || "Created"}</TableHead>
              <TableHead className="text-right">{dictionary?.products?.actions || "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {dictionary?.products?.noProducts || "No products found"}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.images.length > 0 && !imageErrors[product.id] ? (
                          <img
                            src={imageUrl(product.images[0].url) || "/placeholder.svg"}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(product.id)}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 max-w-xs">
                        <p className="font-medium text-sm line-clamp-2 leading-tight" title={product.title}>
                          {product.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {product.id} • {product.brand}
                        </p>
                        {product.isAuction && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {dictionary?.products?.auction || "Auction"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={imageUrl(product.seller.avatarUrl) || "/placeholder.svg"}
                          alt={`${product.seller.firstName} ${product.seller.lastName}`}
                        />
                        <AvatarFallback className="text-xs">
                          {product.seller.firstName.charAt(0)}
                          {product.seller.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {product.seller.firstName} {product.seller.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">@{product.seller.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{product.category}</p>
                      <p className="text-xs text-muted-foreground">{product.subcategory}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">${product.price}</p>
                    {product.size && <p className="text-xs text-muted-foreground">Size: {product.size}</p>}
                  </TableCell>
                  <TableCell>{getConditionBadge(product.condition)}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell className="text-center">
                    {product.isPremium ? (
                      <Badge className="bg-purple-100 text-purple-800">
                        {dictionary?.products?.premium || "Premium"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{format(new Date(product.createdAt), "MMM d, yyyy")}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(product.createdAt), "HH:mm")}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleActionsClick(product)}
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">{dictionary?.products?.openActions || "Open actions"}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {dictionary?.pagination?.showing || "Showing"} {(page - 1) * limit + 1} {dictionary?.pagination?.to || "to"}{" "}
            {Math.min(page * limit, pagination.total)} {dictionary?.pagination?.of || "of"} {pagination.total}{" "}
            {dictionary?.products?.itemsName || "products"}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {dictionary?.pagination?.previous || "Previous"}
            </Button>
            <div className="text-sm">
              {dictionary?.pagination?.page || "Page"} {page} {dictionary?.pagination?.of || "of"} {totalPages}
            </div>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page >= totalPages}>
              {dictionary?.pagination?.next || "Next"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Product Actions Modal */}
      <ProductActionsModal
        isOpen={isActionsModalOpen}
        onClose={handleCloseActionsModal}
        product={selectedProduct}
        dictionary={dictionary}
      />
    </div>
  )
}
