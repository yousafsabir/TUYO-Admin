import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { UsersTable } from "@/components/users/users-table"

export default async function UsersPage({
  params: { lang },
}: {
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{dictionary?.users?.title || "Users"}</h2>
        <p className="text-muted-foreground">{dictionary?.users?.description || "Manage user accounts."}</p>
      </div>

      <UsersTable dictionary={dictionary} />
    </div>
  )
}
