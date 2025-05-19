import type React from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Toaster } from "@/components/ui/toaster";
import { use } from "react";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = use(params);
  const dictionary = getDictionary(lang);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <DashboardSidebar dictionary={dictionary} lang={lang} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader dictionary={dictionary} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
