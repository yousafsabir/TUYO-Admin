import { LoginForm } from './login-form'
import { LanguageToggle } from '@/components/language-toggle'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
	const t = useTranslations()
	return (
		<div className='flex min-h-screen flex-col bg-background'>
			<div className='absolute right-4 top-4'>
				<LanguageToggle />
			</div>
			<div className='flex flex-1 items-center justify-center bg-muted px-4 py-12 sm:px-6 lg:px-8'>
				<div className='w-full max-w-md space-y-8'>
					<div className='text-center'>
						<h2 className='mt-6 text-3xl font-bold tracking-tight text-foreground'>
							{t('login.title')}
						</h2>
					</div>
					<LoginForm />
				</div>
			</div>
		</div>
	)
}
