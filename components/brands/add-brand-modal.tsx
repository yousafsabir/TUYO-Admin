"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { createBrand } from "@/lib/api/brands"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Upload, X } from "lucide-react"

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100, "Brand name must be less than 100 characters"),
  image: z.instanceof(File, "Brand image is required"),
})

type BrandFormValues = z.infer<typeof brandSchema>

interface AddBrandModalProps {
  isOpen: boolean
  onClose: () => void
  dictionary: any
}

export function AddBrandModal({ isOpen, onClose, dictionary }: AddBrandModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
  })

  const selectedImage = watch("image")

  const { mutate: addBrand, isPending } = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      // Invalidate the brands query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["brands"] })

      // Reset form and close modal
      reset()
      setImagePreview(null)
      onClose()
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to create brand")
    },
  })

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setValue("image", file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setValue("image", undefined as any)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onSubmit = (data: BrandFormValues) => {
    setError(null)
    addBrand(data)
  }

  const handleClose = () => {
    if (!isPending) {
      reset()
      setImagePreview(null)
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dictionary?.brands?.addBrand || "Add Brand"}</DialogTitle>
          <DialogDescription>
            {dictionary?.brands?.addBrandDescription || "Create a new brand with name and image."}
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
            <Label htmlFor="name">{dictionary?.brands?.name || "Brand Name"}</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={dictionary?.brands?.namePlaceholder || "Enter brand name"}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">{dictionary?.brands?.image || "Brand Image"}</Label>
            <div className="space-y-2">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Brand preview"
                    className="w-full h-32 object-contain border rounded-md bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    {dictionary?.brands?.uploadImage || "Click to upload brand image"}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
              <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
            {errors.image && <p className="text-sm text-red-500">{errors.image.message}</p>}
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
