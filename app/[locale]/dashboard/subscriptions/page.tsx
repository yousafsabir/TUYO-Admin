import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { SubscriptionsTable } from "@/components/subscriptions/subscriptions-table"

interface SubscriptionsPageProps {
  params: {
    lang: Locale
  }
}

export default async function SubscriptionsPage({ params }: SubscriptionsPageProps) {
  const dictionary = await getDictionary(params.lang)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{dictionary?.subscriptions?.title || "Subscriptions"}</h1>
        <p className="text-muted-foreground">
          {dictionary?.subscriptions?.description || "Manage user subscriptions and plans"}
        </p>
      </div>

      <SubscriptionsTable dictionary={dictionary} />
    </div>
  )
}
