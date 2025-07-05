export const defaultLocale = "es"
export const locales = ["en", "es"] as const
export type Locale = (typeof locales)[number]

function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/")
  const localeSegment = segments.find((segment) => locales.includes(segment as Locale))
  return (localeSegment as Locale) || defaultLocale
}

function getLocaleFromRegion(): Locale {
  if (typeof navigator === "undefined") return defaultLocale

  const browserLanguages = navigator.languages || [navigator.language]

  for (const language of browserLanguages) {
    const languagePrefix = language.split("-")[0].toLowerCase()
    if (locales.includes(languagePrefix as Locale)) {
      return languagePrefix as Locale
    }
  }

  return defaultLocale
}
