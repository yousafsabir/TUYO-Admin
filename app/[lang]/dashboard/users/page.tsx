import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { UsersTable } from "@/components/users/users-table";
import { use } from "react";

export default function UsersPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = use(params);
  const dictionary = getDictionary(lang);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {dictionary?.users?.title || "Users"}
        </h2>
        <p className="text-muted-foreground">
          {dictionary?.users?.description || "Manage user accounts."}
        </p>
      </div>

      <UsersTable dictionary={dictionary} />
    </div>
  );
}
