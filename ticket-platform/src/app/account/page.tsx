"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";

function AccountProfileForm({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { update } = useSession();

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);

  const unchanged = name === initialName && email === initialEmail;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t("account.updateFailed"));
      }

      await update({ name: data.name, email: data.email });
      toast.success(t("account.saved"));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("account.updateFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        name="name"
        label={t("account.nameLabel")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("register.namePlaceholder")}
        required
      />
      <Input
        id="email"
        name="email"
        type="email"
        label={t("account.emailLabel")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("login.emailPlaceholder")}
        required
      />
      <Button type="submit" loading={saving} disabled={unchanged} className="w-full sm:w-auto">
        {t("account.save")}
      </Button>
    </form>
  );
}

export default function AccountPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">{t("account.title")}</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("account.editTitle")}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("account.editHint")}</p>
        </CardHeader>
        <CardContent>
          {session?.user ? (
            <AccountProfileForm
              initialName={session.user.name ?? ""}
              initialEmail={session.user.email ?? ""}
            />
          ) : (
            <div className="h-40 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("account.security")}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("account.securityHint")}</p>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.push("/settings#security")}>
            {t("settings.changePassword")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
