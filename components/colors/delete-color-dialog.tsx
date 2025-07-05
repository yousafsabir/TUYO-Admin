"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteColor, type Color } from "@/lib/api/colors"
import { useToast } from "@/components/ui/use-toast"

interface DeleteColorDialogProps {
  color: Color
  isOpen: boolean
  onClose: () => void
  dictionary: any
}

export function DeleteColorDialog({ color, isOpen, onClose, dictionary }: DeleteColorDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteColorMutation = useMutation({
    mutationFn: deleteColor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colors"] })
      toast({
        title: dictionary?.colors?.colorDeleted || "Color deleted",
        description: dictionary?.colors?.colorDeletedDescription || "The color has been deleted successfully.",
      })
      onClose()
    },
    onError: (error: Error) => {
      toast({
        title: dictionary?.common?.error || "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleDelete = () => {
    deleteColorMutation.mutate({ name: color[0] })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dictionary?.colors?.deleteColor || "Delete Color"}</AlertDialogTitle>
          <AlertDialogDescription>
            {dictionary?.colors?.deleteColorConfirmation || "Are you sure you want to delete this color?"}{" "}
            <span className="font-semibold">{color[0]}</span>{" "}
            {dictionary?.colors?.deleteColorWarning || "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{dictionary?.common?.cancel || "Cancel"}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteColorMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteColorMutation.isPending
              ? dictionary?.common?.deleting || "Deleting..."
              : dictionary?.common?.delete || "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
