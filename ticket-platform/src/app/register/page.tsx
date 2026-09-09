"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function RegisterPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      toast.success(t("register.created"));
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || t("register.failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("register.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("register.subtitle")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" name="name" label={t("register.fullName")} placeholder={t("register.namePlaceholder")} required />
            <Input id="email" name="email" type="email" label={t("register.email")} placeholder={t("login.emailPlaceholder")} required />
            <Input id="password" name="password" type="password" label={t("register.password")} placeholder={t("register.passwordPlaceholder")} required minLength={8} />
            <Button type="submit" loading={loading} className="w-full">
              {t("register.button")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("register.haveAccount")}{" "}
            <Link href="/login" className="font-medium text-[#B8942E] hover:text-[#926F1E]">
              {t("register.signin")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
