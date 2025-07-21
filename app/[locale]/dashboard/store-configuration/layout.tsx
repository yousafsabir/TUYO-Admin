'use client'

import type React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function StoreConfigLayout({ children }: { children: React.ReactNode }) {
	const t = useTranslations()
	const pathname = usePathname()
	const locale = useLocale()
	const configRoutes = [
		{
			title: t('common.config'),
			link: '/dashboard/store-configuration',
		},
		{
			title: t('brands.title'),
			link: '/dashboard/store-configuration/brands',
		},
		{
			title: t('categories.title'),
			link: '/dashboard/store-configuration/categories-subcategories',
		},
		{
			title: t('subscriptionPlans.title'),
			link: '/dashboard/store-configuration/subscription-plans',
		},
		{
			title: t('colors.title'),
			link: '/dashboard/store-configuration/colors',
		},
	]

	return (
		<div>
			<div className='mb-8 border-b'>
				<h2 className='mb-4 text-3xl font-bold tracking-tight'>
					{t('storeConfiguration.title')}
				</h2>
				<p className='mb-8 text-muted-foreground'>{t('storeConfiguration.description')}</p>

				<ul className='flex gap-4'>
					{configRoutes.map((route) => (
						<li key={route.link}>
							<Link href={route.link} className='cursor-pointer'>
								<Button
									variant={
										pathname === `/${locale}${route.link}`
											? 'default'
											: 'outline'
									}
									className='rounded-b-none border-0'>
									{route.title}
								</Button>
							</Link>
						</li>
					))}
				</ul>
			</div>
			<div>{children}</div>
		</div>
	)
}
