"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, CalendarPlus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";

const categories = [
  "Movies",
  "Sports",
  "Festivals",
  "Theater",
  "Conference",
  "Exhibitions",
  "Comedy",
];

interface TicketDraft {
  name: string;
  price: string;
  quantity: string;
  available: string;
  description: string;
}

const emptyTicket: TicketDraft = {
  name: "",
  price: "",
  quantity: "",
  available: "",
  description: "",
};

const initialForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  venue: "",
  address: "",
  city: "",
  category: categories[0],
  organizer: "",
  genre: "",
  image: "",
};

export default function AdminEventsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [form, setForm] = useState(initialForm);
  const [tickets, setTickets] = useState<TicketDraft[]>([{ ...emptyTicket }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && !session?.user?.isAdmin) {
      router.replace("/");
    }
  }, [status, session, router]);

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateTicket(index: number, key: keyof TicketDraft, value: string) {
    setTickets((prev) =>
      prev.map((ticket, i) => (i === index ? { ...ticket, [key]: value } : ticket))
    );
  }

  function addTicket() {
    setTickets((prev) => [...prev, { ...emptyTicket }]);
  }

  function removeTicket(index: number) {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (tickets.length === 0) {
      toast.error(t("admin.needTicket"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          genre: form.genre || undefined,
          image: form.image || undefined,
          ticketTypes: tickets.map((ticket) => ({
            name: ticket.name,
            price: Number(ticket.price),
            quantity: Number(ticket.quantity),
            available: ticket.available === "" ? undefined : Number(ticket.available),
            description: ticket.description,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t("admin.createFailed"));
      }

      toast.success(t("admin.created", { count: data.notified ?? 0 }));
      setForm(initialForm);
      setTickets([{ ...emptyTicket }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("admin.createFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (status !== "authenticated" || !session?.user?.isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-40 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <CalendarPlus className="h-7 w-7 text-[#B8942E]" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("admin.title")}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("admin.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("admin.details")}</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label={t("admin.eventTitle")}
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("admin.description")}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="date"
                label={t("admin.date")}
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                required
              />
              <Input
                label={t("admin.time")}
                placeholder="7:00 PM"
                value={form.time}
                onChange={(e) => updateField("time", e.target.value)}
                required
              />
              <Input
                label={t("admin.venue")}
                value={form.venue}
                onChange={(e) => updateField("venue", e.target.value)}
                required
              />
              <Input
                label={t("admin.address")}
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                required
              />
              <Input
                label={t("admin.city")}
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.category")}
                </label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label={t("admin.organizer")}
                value={form.organizer}
                onChange={(e) => updateField("organizer", e.target.value)}
                required
              />
              <Input
                label={t("admin.genre")}
                placeholder={t("admin.optional")}
                value={form.genre}
                onChange={(e) => updateField("genre", e.target.value)}
              />
            </div>

            <Input
              label={t("admin.image")}
              placeholder="/images/my-event.jpg"
              value={form.image}
              onChange={(e) => updateField("image", e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("admin.tickets")}</h2>
            <Button type="button" variant="outline" size="sm" onClick={addTicket}>
              <Plus className="mr-1 h-4 w-4" />
              {t("admin.addTicket")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {tickets.map((ticket, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("admin.ticket", { count: index + 1 })}
                  </span>
                  {tickets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicket(index)}
                      className="text-red-500 transition hover:text-red-600"
                      aria-label={t("admin.removeTicket")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label={t("admin.ticketName")}
                    value={ticket.name}
                    onChange={(e) => updateTicket(index, "name", e.target.value)}
                    required
                  />
                  <Input
                    label={t("admin.ticketDescription")}
                    value={ticket.description}
                    onChange={(e) => updateTicket(index, "description", e.target.value)}
                  />
                  <Input
                    type="number"
                    min={0}
                    label={t("admin.price")}
                    value={ticket.price}
                    onChange={(e) => updateTicket(index, "price", e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    min={1}
                    label={t("admin.quantity")}
                    value={ticket.quantity}
                    onChange={(e) => updateTicket(index, "quantity", e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    min={0}
                    label={t("admin.available")}
                    placeholder={t("admin.availableHint")}
                    value={ticket.available}
                    onChange={(e) => updateTicket(index, "available", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" loading={saving} size="lg" className="w-full">
          {t("admin.create")}
        </Button>
      </form>
    </div>
  );
}
