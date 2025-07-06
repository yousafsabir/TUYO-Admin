import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { StoreConfigurationForm } from "@/components/store-configuration/store-configuration-form"

export default async function StoreConfigurationPage({
  params: { lang },
}: {
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {dictionary?.storeConfiguration?.title || "Store Configuration"}
        </h2>
        <p className="text-muted-foreground">
          {dictionary?.storeConfiguration?.description || "Manage store settings and configuration."}
        </p>
      </div>

      <StoreConfigurationForm dictionary={dictionary} />
    </div>
  )
}
