"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { locales, type Locale } from "@/lib/i18n/config"

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
}

export function LanguageToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentLang, setCurrentLang] = useState<Locale>("es")

  // Load saved language preference on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Locale | null
    if (savedLang && locales.includes(savedLang)) {
      setCurrentLang(savedLang)
    } else {
      // Extract current language from URL if no saved preference
      const urlLang = pathname.split("/")[1] as Locale
      if (locales.includes(urlLang)) {
        setCurrentLang(urlLang)
      }
    }
  }, [pathname])

  const switchLanguage = (locale: Locale) => {
    if (locale === currentLang) return

    // Save preference to localStorage
    localStorage.setItem("language", locale)
    setCurrentLang(locale)

    // Navigate to the same page but with different locale
    const segments = pathname.split("/")

    if (locales.includes(segments[1] as Locale)) {
      segments[1] = locale
      router.push(segments.join("/"))
    } else {
      router.push(`/${locale}${pathname}`)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={locale === currentLang ? "bg-muted font-medium" : ""}
          >
            {LANGUAGE_NAMES[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
