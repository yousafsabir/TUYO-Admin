import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import EditProductForm from "./edit-product-form";
import { useTranslations } from "next-intl";
import { use } from "react";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("products.editProduct") || "Edit Product"}
        </h2>
        <p className="text-muted-foreground">
          {t("products.editProductDescription") ||
            "Update product information."}
        </p>
      </div>

      <EditProductForm productId={Number.parseInt(id)} />
    </div>
  );
}
