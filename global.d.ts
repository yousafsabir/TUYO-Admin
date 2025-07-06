import { routing } from '@/i18n/routing'
import messages from '@/i18n/messages/en.json'

declare module 'next-intl' {
	interface AppConfig {
		Locale: 'en' | 'es'
		Messages: typeof messages
	}
}
