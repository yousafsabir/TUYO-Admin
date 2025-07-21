import { SubscriptionPlansTable } from '@/components/subscription-plans/subscription-plans-table'
import { useTranslations } from 'next-intl'

export default function SubscriptionPlansPage() {
	const t = useTranslations()
	return (
		<div>
			<div className='mb-4'>
				<p>
					{t('subscriptionPlans.description') ||
						'Manage subscription plans and their features.'}
				</p>
			</div>
			<SubscriptionPlansTable />
		</div>
	)
}
