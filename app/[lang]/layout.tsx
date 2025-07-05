import type React from "react"
import { type Locale, locales } from "@/lib/i18n/config"
import { QueryProvider } from "@/lib/providers/query-provider"
import { LanguageSync } from "@/components/language-sync"
import { AuthProvider } from "@/lib/context/auth-context"

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default function LocaleLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: { lang: Locale }
}) {
  return (
    <>
      <LanguageSync />
      <QueryProvider>
        <AuthProvider>
          <div key={lang} className="h-full">
            {children}
          </div>
        </AuthProvider>
      </QueryProvider>
    </>
  )
}
