import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { AdminsPageWrapper } from "./page-wrapper"

export default async function AdminsPage({
  params: { lang },
}: {
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary(lang)

  return <AdminsPageWrapper dictionary={dictionary} lang={lang} />
}
