"use client";

import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function PrivacyPage() {
  const { t } = useLanguage();

  const sections = [
    { title: "legal.privacy.s1t", body: "legal.privacy.s1b" },
    { title: "legal.privacy.s2t", body: "legal.privacy.s2b" },
    { title: "legal.privacy.s3t", body: "legal.privacy.s3b" },
    { title: "legal.privacy.s4t", body: "legal.privacy.s4b" },
    { title: "legal.privacy.s5t", body: "legal.privacy.s5b" },
    { title: "legal.privacy.s6t", body: "legal.privacy.s6b" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600/10">
          <ShieldCheck className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("legal.privacy.title")}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("legal.privacy.updated", { date: t("legal.privacy.updatedValue") })}
          </p>
        </div>
      </div>

      <p className="mb-8 text-gray-600 dark:text-gray-300">{t("legal.privacy.intro")}</p>

      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{t(s.title)}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t(s.body)}</p>
          </section>
        ))}

        <section>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{t("legal.privacy.s7t")}</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t("legal.privacy.s7b", {
              email: t("contact.emailValue"),
              phone: t("contact.phoneValue"),
            })}
          </p>
        </section>
      </div>
    </div>
  );
}
