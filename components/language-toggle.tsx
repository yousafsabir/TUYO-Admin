'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { useLocale } from 'next-intl'
import { Locale, locales } from '@/i18n/routing'

const LANGUAGE_NAMES: Record<Locale, string> = {
	en: 'English',
	es: 'Español',
}

export function LanguageToggle() {
	const router = useRouter()
	const pathname = usePathname()
	const locale = useLocale()
	const [currentLang, setCurrentLang] = useState<Locale>('es')

	// Load saved language preference on mount
	useEffect(() => {
		setCurrentLang(locale)
	}, [])

	const switchLanguage = (locale: Locale) => {
		if (locale === currentLang) return
		router.push('/' + locale + pathname.slice(3))
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' size='icon' className='rounded-full'>
					<Globe className='h-5 w-5' />
					<span className='sr-only'>Toggle language</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				{locales.map((locale) => (
					<DropdownMenuItem
						key={locale}
						onClick={() => switchLanguage(locale)}
						className={locale === currentLang ? 'bg-muted font-medium' : ''}>
						{LANGUAGE_NAMES[locale]}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
