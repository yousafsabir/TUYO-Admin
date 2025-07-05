"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { adminSchema, type AdminFormValues } from "@/lib/validations/admin"
import { createAdmin } from "@/lib/api/auth"
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
import { AlertCircle, Loader2 } from "lucide-react"

interface AddAdminModalProps {
  isOpen: boolean
  onClose: () => void
  dictionary: any
}

export function AddAdminModal({ isOpen, onClose, dictionary }: AddAdminModalProps) {
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema(dictionary)),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const { mutate: addAdmin, isPending } = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      // Invalidate the admins query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["admins"] })

      // Reset form and close modal
      reset()
      onClose()
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to create admin")
    },
  })

  const onSubmit = (data: AdminFormValues) => {
    setError(null)
    addAdmin(data)
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
          <DialogTitle>{dictionary?.admin?.addAdmin || "Add Admin"}</DialogTitle>
          <DialogDescription>
            {dictionary?.admin?.addAdminDescription || "Create a new administrator account."}
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
            <Label htmlFor="name">{dictionary?.admin?.name || "Name"}</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={dictionary?.admin?.namePlaceholder || "Enter admin name"}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{dictionary?.admin?.email || "Email"}</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder={dictionary?.admin?.emailPlaceholder || "Enter admin email"}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{dictionary?.admin?.password || "Password"}</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder={dictionary?.admin?.passwordPlaceholder || "Enter admin password"}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
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
