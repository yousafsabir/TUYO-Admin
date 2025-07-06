import { AuthProvider } from '@/lib/context/auth-context'
import { QueryProvider } from '@/lib/providers/query-provider'
import { NextIntlClientProvider } from 'next-intl'

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<NextIntlClientProvider timeZone='UTC'>
			<QueryProvider>
				<AuthProvider>{children}</AuthProvider>
			</QueryProvider>
		</NextIntlClientProvider>
	)
}
