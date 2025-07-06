'use client'

import { StoreConfigurationForm } from '@/components/store-configuration/store-configuration-form'
import { useTranslations } from 'next-intl'

export default function StoreConfigurationPage() {
	const t = useTranslations()

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-3xl font-bold tracking-tight'>
					{t('storeConfiguration.title')}
				</h2>
				<p className='text-muted-foreground'>{t('storeConfiguration.description')}</p>
			</div>

			<StoreConfigurationForm />
		</div>
	)
}
