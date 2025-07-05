"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getAllBrands, type Brand } from "@/lib/api/brands"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Loader2, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EditBrandModal } from "./edit-brand-modal"
import { DeleteBrandDialog } from "./delete-brand-dialog"
import { imageUrl } from "@/lib/utils"

interface BrandsTableProps {
  dictionary: any
}

export function BrandsTable({ dictionary }: BrandsTableProps) {
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["brands"],
    queryFn: getAllBrands,
  })

  const handleEditClick = (brand: Brand) => {
    setBrandToEdit(brand)
  }

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand)
  }

  const handleImageError = (brandName: string) => {
    setImageErrors((prev) => ({ ...prev, [brandName]: true }))
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
        <AlertDescription>{error instanceof Error ? error.message : "Failed to load brands"}</AlertDescription>
      </Alert>
    )
  }

  const brands = data?.data || []

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dictionary?.brands?.image || "Image"}</TableHead>
              <TableHead>{dictionary?.brands?.name || "Name"}</TableHead>
              <TableHead className="text-right">{dictionary?.brands?.actions || "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  {dictionary?.brands?.noBrands || "No brands found"}
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand: Brand) => (
                <TableRow key={brand.name}>
                  <TableCell>
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                      {!imageErrors[brand.name] ? (
                        <img
                          src={imageUrl(brand.imageUrl) || "/placeholder.svg"}
                          alt={brand.name}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(brand.name)}
                        />
                      ) : (
                        <div className="text-xs text-gray-400 text-center">No Image</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(brand)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {dictionary?.brands?.edit || "Edit"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(brand)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {dictionary?.brands?.delete || "Delete"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Brand Modal */}
      <EditBrandModal
        isOpen={brandToEdit !== null}
        onClose={() => setBrandToEdit(null)}
        brand={brandToEdit}
        dictionary={dictionary}
      />

      {/* Delete Brand Dialog */}
      <DeleteBrandDialog
        isOpen={brandToDelete !== null}
        onClose={() => setBrandToDelete(null)}
        brand={brandToDelete}
        dictionary={dictionary}
      />
    </div>
  )
}
