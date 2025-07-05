import { redirect } from "next/navigation"
import { defaultLocale } from "@/lib/i18n/config"

export default function Home() {
  // This ensures we redirect from / to /es
  redirect(`/${defaultLocale}`)
}
