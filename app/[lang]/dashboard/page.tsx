import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "./dashboard-stats"
import { RecentActivityTable } from "@/components/audit-logs/recent-activity-table"

export default async function DashboardPage({
  params: { lang },
}: {
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{dictionary?.dashboard?.title || "Dashboard"}</h2>
        <p className="text-muted-foreground">
          {dictionary?.dashboard?.welcome || "Welcome to Tuyo Panel administration dashboard."}
        </p>
      </div>

      <DashboardStats dictionary={dictionary} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>{dictionary?.dashboard?.recentActivity || "Recent Activity"}</CardTitle>
            <CardDescription>
              {dictionary?.dashboard?.latestActions || "Latest actions performed in the system"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityTable dictionary={dictionary} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
