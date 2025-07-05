"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { createSubcategory } from "@/lib/api/categories"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { subcategoriesIcons, getSubcategoryIconLabel, type SubcategoryIconKey } from "@/lib/subcategories-icons"

const subcategorySchema = z.object({
  categoryId: z.number().min(1, "Category is required"),
  name: z.string().min(1, "Subcategory name is required").max(100, "Subcategory name must be less than 100 characters"),
  iconKey: z.string().min(1, "Icon is required"),
})

type SubcategoryFormValues = z.infer<typeof subcategorySchema>

interface AddSubcategoryModalProps {
  isOpen: boolean
  onClose: () => void
  categoriesData: { [categoryName: string]: { id: number; subcategories: [string, string][] } }
  dictionary: any
}

export function AddSubcategoryModal({ isOpen, onClose, categoriesData, dictionary }: AddSubcategoryModalProps) {
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategorySchema),
  })

  const selectedCategoryId = watch("categoryId")
  const selectedIconKey = watch("iconKey")

  const { mutate: addSubcategory, isPending } = useMutation({
    mutationFn: createSubcategory,
    onSuccess: () => {
      // Invalidate the categories query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["categories-subcategories"] })

      // Reset form and close modal
      reset()
      onClose()
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to create subcategory")
    },
  })

  const onSubmit = (data: SubcategoryFormValues) => {
    setError(null)
    addSubcategory(data)
  }

  const handleClose = () => {
    if (!isPending) {
      reset()
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dictionary?.subcategories?.addSubcategory || "Add Subcategory"}</DialogTitle>
          <DialogDescription>
            {dictionary?.subcategories?.addSubcategoryDescription || "Create a new subcategory under a category."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">{dictionary?.subcategories?.category || "Category"}</Label>
            <Select
              onValueChange={(value) => setValue("categoryId", Number.parseInt(value))}
              value={selectedCategoryId?.toString()}
            >
              <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                <SelectValue placeholder={dictionary?.subcategories?.selectCategory || "Select a category"} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoriesData).map(([categoryName, categoryData]) => (
                  <SelectItem key={categoryData.id} value={categoryData.id.toString()}>
                    {categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{dictionary?.subcategories?.name || "Subcategory Name"}</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={dictionary?.subcategories?.namePlaceholder || "Enter subcategory name"}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="iconKey">{dictionary?.subcategories?.icon || "Icon"}</Label>
            <Select onValueChange={(value) => setValue("iconKey", value)} value={selectedIconKey}>
              <SelectTrigger className={errors.iconKey ? "border-red-500" : ""}>
                <SelectValue placeholder={dictionary?.subcategories?.selectIcon || "Select an icon"} />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(subcategoriesIcons).map((key) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center">
                        {subcategoriesIcons[key as SubcategoryIconKey]}
                      </div>
                      {getSubcategoryIconLabel(key as SubcategoryIconKey)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.iconKey && <p className="text-sm text-red-500">{errors.iconKey.message}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              {dictionary?.common?.cancel || "Cancel"}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {dictionary?.common?.creating || "Creating..."}
                </>
              ) : (
                dictionary?.common?.create || "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
