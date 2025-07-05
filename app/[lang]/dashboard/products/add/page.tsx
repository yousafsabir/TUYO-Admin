import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import AddProductForm from "./add-product-form"

export default async function AddProductPage({
  params: { lang },
}: {
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{dictionary?.products?.add || "Add Product"}</h2>
        <p className="text-muted-foreground">
          {dictionary?.products?.addDescription || "Create a new product listing."}
        </p>
      </div>

      <AddProductForm dictionary={dictionary} />
    </div>
  )
}
