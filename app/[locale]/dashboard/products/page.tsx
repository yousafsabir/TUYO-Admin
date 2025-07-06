import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProductsTable } from "@/components/products/products-table"

export default async function ProductsPage({
  params: { lang },
}: {
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{dictionary?.products?.title || "Products"}</h2>
        <p className="text-muted-foreground">{dictionary?.products?.description || "Manage product listings."}</p>
      </div>

      <ProductsTable dictionary={dictionary} lang={lang} />
    </div>
  )
}
