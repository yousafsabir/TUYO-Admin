import type React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { getLocale } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Panel Tuyo',
	description: 'Panel de administración de Tuyo Store',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const locale = await getLocale()

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={inter.className}>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange={false}>
					{children}
				</ThemeProvider>
			</body>
		</html>
	)
}
