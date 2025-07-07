import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import Cookies from 'js-cookie'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function imageUrl(url: string | null | undefined): string {
	if (!url) return '/placeholder.svg'

	// If it's already a full URL, return as is
	if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
		return url
	}

	// If it's a relative path, prepend your API base URL or CDN URL
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
	return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

const availableLocales = ['en', 'es']

export function getLocale() {
	const lang = Cookies.get('language')

	console.log('Lang: ', lang)

	let locale: any = 'es'
	if (lang && availableLocales.includes(lang)) {
		locale = lang
	} else {
		setLocale(locale)
	}

	return locale
}

export function setLocale(locale: (typeof availableLocales)[number]) {
	if (availableLocales.includes(locale)) {
		Cookies.set('language', locale, {
			expires: 365,
			path: '/',
			sameSite: 'strict',
			secure: false,
		})
	}
}

export async function copyTextToClipboard(textToCopy: string) {
	try {
		await navigator.clipboard.writeText(textToCopy)
		return true // Indicate success
	} catch (err) {
		// Fallback for older browsers or environments where Clipboard API is not available/permitted
		// This fallback involves creating a temporary textarea, selecting its content, and using execCommand('copy')
		const tempTextArea = document.createElement('textarea')
		tempTextArea.value = textToCopy
		document.body.appendChild(tempTextArea)
		tempTextArea.select()
		try {
			document.execCommand('copy')
			document.body.removeChild(tempTextArea)
			return true // Indicate success
		} catch (execErr) {
			document.body.removeChild(tempTextArea)
			return false // Indicate failure
		}
	}
}

import { xxhash64 } from 'hash-wasm'

export async function xxHash(input: string) {
	try {
		const encoder = new TextEncoder()
		const encodedData = encoder.encode(input)

		const hashValue = await xxhash64(encodedData)
		return hashValue
	} catch (error) {
		console.error('Hashing error:', error)
		return ''
	}
}
