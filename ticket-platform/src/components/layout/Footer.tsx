"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { categories } from "@/lib/categories";

const socials = [
  {
    name: "Facebook",
    href: "https://facebook.com/mitarichris",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/mitarichris",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
  },
  {
    name: "X (Twitter)",
    href: "https://x.com/Mitarichris23",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/mitari-murenzi-chris-358526324/",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  },
];

const footerCategories = categories.slice(0, 5);

export function Footer() {
  const { t } = useLanguage();
  const linkClass =
    "text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white";

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <Image
              src="/logo.svg"
              alt="TicketHub"
              width={180}
              height={63}
              className="h-10 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {t("footer.tagline")}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  title={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:text-slate-500 dark:hover:border-slate-700 dark:hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              {t("footer.explore")}
            </h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/events" className={linkClass}>
                  {t("footer.browse")}
                </Link>
              </li>
              {footerCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/events?category=${encodeURIComponent(category.slug)}`}
                    className={linkClass}
                  >
                    {t(category.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              {t("footer.support")}
            </h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/orders" className={linkClass}>
                  {t("footer.myOrders")}
                </Link>
              </li>
              <li>
                <Link href="/guide" className={linkClass}>
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className={linkClass}>
                  {t("footer.contactUs")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={linkClass}>
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/user-agreement" className={linkClass}>
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              {t("footer.payments")}
            </h2>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                {t("footer.paymentNote")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  MTN MoMo
                </span>
                <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Airtel Money
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("footer.rights", { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/user-agreement" className={linkClass}>
              {t("footer.terms")}
            </Link>
            <Link href="/privacy" className={linkClass}>
              {t("footer.privacy")}
            </Link>
            <Link href="/contact-us" className={linkClass}>
              {t("footer.contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
