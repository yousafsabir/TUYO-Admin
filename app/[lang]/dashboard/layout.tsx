import type React from "react"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Toaster } from "@/components/ui/toaster"

export default async function DashboardLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
        <DashboardSidebar dictionary={dictionary} lang={lang} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader dictionary={dictionary} />
          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">{children}</main>
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  )
}
