"use client"

import { useState } from "react"
import type { Locale } from "@/lib/i18n/config"
import { AdminsTable } from "@/components/admins/admins-table"
import { AddAdminModal } from "@/components/admins/add-admin-modal"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"
import { ROOT_ADMIN_EMAIL } from "@/lib/constants"

interface AdminsPageWrapperProps {
  dictionary: any
  lang: Locale
}

export function AdminsPageWrapper({ dictionary, lang }: AdminsPageWrapperProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { user } = useAuth()

  // Check if current user is root admin
  const isRootAdmin = user?.email === ROOT_ADMIN_EMAIL

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{dictionary?.admin?.title || "Admins"}</h2>
          <p className="text-muted-foreground">{dictionary?.admin?.description || "Manage administrator accounts."}</p>
        </div>
        {isRootAdmin && (
          <Button onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {dictionary?.admin?.addAdmin || "Add Admin"}
          </Button>
        )}
      </div>

      <AdminsTable dictionary={dictionary} />

      {/* Add Admin Modal - Only show for root admin */}
      {isRootAdmin && (
        <AddAdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} dictionary={dictionary} />
      )}
    </div>
  )
}
