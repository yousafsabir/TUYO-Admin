import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AdminsPageWrapper } from "./page-wrapper";
import { use } from "react";

export default function AdminsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = use(params);
  const dictionary = getDictionary(lang);

  return <AdminsPageWrapper dictionary={dictionary} lang={lang} />;
}
