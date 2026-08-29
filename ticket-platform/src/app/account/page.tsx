"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function AccountPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">{t("account.title")}</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("account.profile")}</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p>
            <span className="font-medium text-gray-900 dark:text-white">{t("account.name")}</span>{" "}
            {session?.user?.name || "—"}
          </p>
          <p>
            <span className="font-medium text-gray-900 dark:text-white">{t("account.email")}</span>{" "}
            {session?.user?.email || "—"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
