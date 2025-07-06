import { defineRouting } from 'next-intl/routing'

export type Locale = 'es' | 'en'

export const locales: Locale[] = ['es', 'en']

export const routing = defineRouting({
	// A list of all locales that are supported
	locales: ['es', 'en'],
	localePrefix: 'always',
	defaultLocale: 'es',
})
