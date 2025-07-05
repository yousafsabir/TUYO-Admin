import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import EditProductForm from "./edit-product-form"

export default async function EditProductPage({
  params: { lang, id },
}: {
  params: { lang: Locale; id: string }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{dictionary?.products?.edit || "Edit Product"}</h2>
        <p className="text-muted-foreground">
          {dictionary?.products?.editDescription || "Update product information."}
        </p>
      </div>

      <EditProductForm productId={Number.parseInt(id)} dictionary={dictionary} />
    </div>
  )
}
