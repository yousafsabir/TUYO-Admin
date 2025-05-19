export const defaultLocale = "es";
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/");
  const localeSegment = segments.find((segment) =>
    locales.includes(segment as Locale),
  );
  return (localeSegment as Locale) || defaultLocale;
}

export function getLocaleFromRegion(): Locale {
  return defaultLocale;
}
