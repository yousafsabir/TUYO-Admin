import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { OrdersTable } from "@/components/orders/orders-table"

export default async function OrdersPage({
  params: { lang },
}: {
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{dictionary?.orders?.title || "Orders"}</h2>
        <p className="text-muted-foreground">
          {dictionary?.orders?.description || "Manage customer orders and track their status."}
        </p>
      </div>

      <OrdersTable dictionary={dictionary} />
    </div>
  )
}
