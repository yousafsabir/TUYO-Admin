import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LoginForm } from "./login-form";
import { LanguageToggle } from "@/components/language-toggle";
import { DebugInfo } from "@/components/debug-info";
import { use } from "react";

export default function LoginPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = use(params);
  const dictionary = getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>
      <div className="flex flex-1 items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              {dictionary.login.title}
            </h2>
          </div>
          <LoginForm dictionary={dictionary} />
        </div>
      </div>
      {process.env.NODE_ENV !== "production" && <DebugInfo />}
    </div>
  );
}
