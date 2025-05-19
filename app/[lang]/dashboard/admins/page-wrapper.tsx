"use client"

import { useState } from "react"
import type { Locale } from "@/lib/i18n/config"
import { AdminsTable } from "@/components/admins/admins-table"
import { AddAdminModal } from "@/components/admins/add-admin-modal"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface AdminsPageWrapperProps {
  dictionary: any
  lang: Locale
}

export function AdminsPageWrapper({ dictionary, lang }: AdminsPageWrapperProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{dictionary?.admin?.title || "Admins"}</h2>
          <p className="text-muted-foreground">{dictionary?.admin?.description || "Manage administrator accounts."}</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {dictionary?.admin?.addAdmin || "Add Admin"}
        </Button>
      </div>

      <AdminsTable dictionary={dictionary} />

      <AddAdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} dictionary={dictionary} />
    </div>
  )
}
