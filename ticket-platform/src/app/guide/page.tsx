"use client";

import { BookOpen, CreditCard, Gift, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageProvider";

const bookingSteps = [
  "guide.book.s1",
  "guide.book.s2",
  "guide.book.s3",
  "guide.book.s4",
  "guide.book.s5",
  "guide.book.s6",
  "guide.book.s7",
];

const freeSteps = ["guide.free.step1", "guide.free.step2", "guide.free.step3"];

function Step({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E2A44] text-xs font-bold text-white dark:bg-[#D4AF37] dark:text-[#101114]">
        {index}
      </span>
      <span className="text-sm text-gray-600 dark:text-gray-300">{children}</span>
    </li>
  );
}

export default function GuidePage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37]/15">
          <BookOpen className="h-6 w-6 text-[#B8942E]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("guide.title")}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("guide.subtitle")}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <BookOpen className="h-5 w-5 text-[#B8942E]" />
            {t("guide.book.title")}
          </h2>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {bookingSteps.map((key, i) => (
              <Step key={key} index={i + 1}>
                {t(key)}
              </Step>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <CreditCard className="h-5 w-5 text-[#B8942E]" />
            {t("guide.pay.title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("guide.pay.intro")}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCC00] text-[10px] font-bold text-black">
              MTN
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t("guide.pay.mtnLabel")}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("guide.pay.mtn")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ED1C24] text-[10px] font-bold text-white">
              Airtel
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t("guide.pay.airtelLabel")}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("guide.pay.airtel")}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">{t("guide.pay.note")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Gift className="h-5 w-5 text-[#B8942E]" />
            {t("guide.free.title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("guide.free.intro")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 p-3">
            <Gift className="h-5 w-5 shrink-0 text-[#B8942E]" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">{t("guide.free.reward")}</p>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <CheckCircle2 className="h-4 w-4 text-[#B8942E]" />
              {t("guide.free.howTitle")}
            </p>
            <ol className="space-y-3">
              {freeSteps.map((key, i) => (
                <Step key={key} index={i + 1}>
                  {t(key)}
                </Step>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
