"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Moon, Sun, User, Bell, Shield, CreditCard, Languages, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-3 text-left"
    >
      <span>
        <span className="block text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        <span className="mt-0.5 block text-sm text-gray-500 dark:text-gray-400">{description}</span>
      </span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-[#D4AF37]" : "bg-gray-300 dark:bg-gray-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

function PaymentMethodRow({
  name,
  badge,
  badgeClassName,
  subtitle,
  availableLabel,
}: {
  name: string;
  badge: string;
  badgeClassName: string;
  subtitle: string;
  availableLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-bold ${badgeClassName}`}
        >
          {badge}
        </span>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
        {availableLabel}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  function handlePreferenceSaved(message: string) {
    toast.success(message);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">{t("settings.title")}</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Sun className="h-5 w-5 text-[#B8942E]" />
              {t("settings.appearance")}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t("settings.darkMode")}</p>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {t("settings.darkModeHint")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-[#B8942E]" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-500" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTheme(theme === "dark" ? "light" : "dark");
                    handlePreferenceSaved(theme === "dark" ? t("settings.lightOn") : t("settings.darkOn"));
                  }}
                >
                  {theme === "dark" ? t("settings.switchToLight") : t("settings.switchToDark")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <User className="h-5 w-5 text-[#B8942E]" />
              {t("settings.profile")}
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>
              <span className="font-medium text-gray-900 dark:text-white">{t("settings.name")}</span>{" "}
              {session?.user?.name || "\u2014"}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-white">{t("settings.email")}</span>{" "}
              {session?.user?.email || "\u2014"}
            </p>
            <Button variant="outline" size="sm" onClick={() => router.push("/account")}>
              {t("settings.editProfile")}
            </Button>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t("settings.profileHint")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Bell className="h-5 w-5 text-[#B8942E]" />
              {t("settings.notifications")}
            </h2>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
            <Toggle
              checked={paymentAlerts}
              onChange={(v) => {
                setPaymentAlerts(v);
                handlePreferenceSaved(t("settings.updated"));
              }}
              label={t("settings.paymentAlerts")}
              description={t("settings.paymentAlertsHint")}
            />
            <Toggle
              checked={orderUpdates}
              onChange={(v) => {
                setOrderUpdates(v);
                handlePreferenceSaved(t("settings.updated"));
              }}
              label={t("settings.orderUpdates")}
              description={t("settings.orderUpdatesHint")}
            />
            <Toggle
              checked={emailAlerts}
              onChange={(v) => {
                setEmailAlerts(v);
                handlePreferenceSaved(t("settings.updated"));
              }}
              label={t("settings.emailNotif")}
              description={t("settings.emailNotifHint")}
            />
          </CardContent>
        </Card>

        <Card id="security" className="scroll-mt-20">
          <CardHeader>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Shield className="h-5 w-5 text-[#B8942E]" />
              {t("settings.security")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("settings.changePasswordHint")}
            </p>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <CreditCard className="h-5 w-5 text-[#B8942E]" />
              {t("settings.payments")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("settings.paymentMethodsHint")}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <PaymentMethodRow
              name="MTN MoMo"
              badge="MTN"
              badgeClassName="bg-[#FFCC00] text-black"
              subtitle={t("settings.mobileMoney")}
              availableLabel={t("settings.available")}
            />
            <PaymentMethodRow
              name="Airtel Money"
              badge="Airtel"
              badgeClassName="bg-[#ED1C24] text-white"
              subtitle={t("settings.mobileMoney")}
              availableLabel={t("settings.available")}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t("settings.managePaymentsHint")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Languages className="h-5 w-5 text-[#B8942E]" />
              {t("settings.preferences")}
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t("settings.language")}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info(t("settings.languageSoon"))}
              >
                English
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t("settings.currency")}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info(t("settings.currencySoon"))}
              >
                {t("settings.rwf")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-red-600 dark:text-red-400">
              <LogOut className="h-5 w-5" />
              {t("settings.account")}
            </h2>
          </CardHeader>
          <CardContent>
            <Button variant="danger" className="w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
              {t("settings.signOut")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
