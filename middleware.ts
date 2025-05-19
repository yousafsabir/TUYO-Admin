import { type NextRequest, NextResponse } from "next/server"
import { defaultLocale, locales } from "./lib/i18n/config"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (pathnameHasLocale) return NextResponse.next()

  // Check for saved language preference in cookies
  const savedLang = request.cookies.get("language")?.value
  const preferredLocale = savedLang && locales.includes(savedLang as any) ? savedLang : defaultLocale

  // If pathname is root, redirect to preferred locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${preferredLocale}`, request.url))
  }

  // Otherwise, add the preferred locale prefix
  return NextResponse.redirect(new URL(`/${preferredLocale}${pathname}`, request.url))
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
