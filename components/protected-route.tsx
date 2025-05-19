"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { defaultLocale } from "@/lib/i18n/config"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      // Store the attempted URL to redirect back after login
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterLogin", pathname)
      }
      router.push(`/${defaultLocale}/login`)
    }
  }, [isAuthenticated, isLoading, router, pathname, isClient])

  // Don't render anything on the server or during initial client load
  // to prevent flash of unauthorized content
  if (!isClient || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  // If authenticated, render the children
  return isAuthenticated ? <>{children}</> : null
}
