"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { updateColor, type Color } from "@/lib/api/colors"
import { useToast } from "@/components/ui/use-toast"

interface EditColorModalProps {
  color: Color
  isOpen: boolean
  onClose: () => void
  dictionary: any
}

export function EditColorModal({ color, isOpen, onClose, dictionary }: EditColorModalProps) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("#000000")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (color) {
      setName(color[0])
      setCode(color[1])
    }
  }, [color])

  const updateColorMutation = useMutation({
    mutationFn: updateColor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colors"] })
      toast({
        title: dictionary?.colors?.colorUpdated || "Color updated",
        description: dictionary?.colors?.colorUpdatedDescription || "The color has been updated successfully.",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({
        title: dictionary?.common?.error || "Error",
        description: dictionary?.colors?.nameRequired || "Color name is required",
        variant: "destructive",
      })
      return
    }

    updateColorMutation.mutate({
      name: color[0], // original name
      newName: name.trim(),
      code,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dictionary?.colors?.editColor || "Edit Color"}</DialogTitle>
          <DialogDescription>
            {dictionary?.colors?.editColorDescription || "Update the color information."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {dictionary?.colors?.name || "Name"}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder={dictionary?.colors?.namePlaceholder || "Enter color name"}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                {dictionary?.colors?.color || "Color"}
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Input
                  id="code"
                  type="color"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 font-mono"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">{dictionary?.colors?.preview || "Preview"}</div>
              <div className="col-span-3">
                <div className="w-full h-10 rounded border border-gray-300" style={{ backgroundColor: code }} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {dictionary?.common?.cancel || "Cancel"}
            </Button>
            <Button type="submit" disabled={updateColorMutation.isPending}>
              {updateColorMutation.isPending
                ? dictionary?.common?.updating || "Updating..."
                : dictionary?.colors?.updateColor || "Update Color"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
