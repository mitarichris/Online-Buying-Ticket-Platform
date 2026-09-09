"use client";

import { FileText } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function UserAgreementPage() {
  const { t } = useLanguage();

  const sections = [
    { title: "legal.terms.s1t", body: "legal.terms.s1b" },
    { title: "legal.terms.s2t", body: "legal.terms.s2b" },
    { title: "legal.terms.s3t", body: "legal.terms.s3b" },
    { title: "legal.terms.s4t", body: "legal.terms.s4b" },
    { title: "legal.terms.s5t", body: "legal.terms.s5b" },
    { title: "legal.terms.s6t", body: "legal.terms.s6b" },
    { title: "legal.terms.s7t", body: "legal.terms.s7b" },
    { title: "legal.terms.s8t", body: "legal.terms.s8b" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37]/15">
          <FileText className="h-6 w-6 text-[#B8942E]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("legal.terms.title")}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("legal.terms.updated", { date: t("legal.privacy.updatedValue") })}
          </p>
        </div>
      </div>

      <p className="mb-8 text-gray-600 dark:text-gray-300">{t("legal.terms.intro")}</p>

      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{t(s.title)}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t(s.body)}</p>
          </section>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{t("legal.terms.s9t")}</h2>
        <p className="text-gray-600 dark:text-gray-300">
          {t("legal.terms.s9b", {
            email: t("contact.emailValue"),
            phone: t("contact.phoneValue"),
          })}
        </p>
      </section>
    </div>
  );
}
