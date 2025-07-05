"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { locales, type Locale } from "@/lib/i18n/config"
import Cookies from "js-cookie"

export function LanguageSync() {
  const pathname = usePathname()

  useEffect(() => {
    // On mount or pathname change, sync localStorage with cookies
    const syncLanguagePreference = () => {
      // First check localStorage
      const savedLang = localStorage.getItem("language") as Locale | null

      if (savedLang && locales.includes(savedLang)) {
        // Set cookie for server-side access (middleware)
        Cookies.set("language", savedLang, { expires: 365, path: "/" })
      } else {
        // If no localStorage preference, extract from URL and save
        const urlLang = pathname.split("/")[1] as Locale
        if (locales.includes(urlLang)) {
          localStorage.setItem("language", urlLang)
          Cookies.set("language", urlLang, { expires: 365, path: "/" })
        }
      }
    }

    syncLanguagePreference()
  }, [pathname])

  // This is a utility component with no UI
  return null
}
