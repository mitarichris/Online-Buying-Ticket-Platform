"use client";

import { Mail, Phone, MessageCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function ContactPage() {
  const { t } = useLanguage();

  const email = t("contact.emailValue");
  const phone = t("contact.phoneValue");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15">
          <MessageCircle className="h-7 w-7 text-[#B8942E]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("contact.title")}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t("contact.subtitle")}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-5 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t("contact.reach")}
        </p>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#D4AF37]/15">
                <Mail className="h-5 w-5 text-[#B8942E]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("contact.email")}</p>
                <p className="font-medium text-gray-900 dark:text-white">{email}</p>
              </div>
            </div>
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center justify-center rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#0F172A] transition hover:bg-[#B8942E]"
            >
              {t("contact.mailto")}
            </a>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#D4AF37]/15">
                <Phone className="h-5 w-5 text-[#B8942E]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("contact.phone")}</p>
                <p className="font-medium text-gray-900 dark:text-white">{phone}</p>
              </div>
            </div>
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#0F172A] transition hover:bg-[#B8942E]"
            >
              {t("contact.call")}
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">{t("contact.response")}</p>
      </div>
    </div>
  );
}
