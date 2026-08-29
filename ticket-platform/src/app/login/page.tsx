"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function LoginPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email") as string,
      password: form.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      toast.error(t("login.invalid"));
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("login.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("login.welcome")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label={t("login.email")}
              placeholder={t("login.emailPlaceholder")}
              required
            />
            <Input
              id="password"
              name="password"
              type="password"
              label={t("login.password")}
              placeholder={t("login.passwordPlaceholder")}
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              {t("login.button")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("login.noAccount")}{" "}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              {t("login.signup")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
