"use client";

import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Home,
  LogIn,
  Menu,
  ShieldCheck,
  ShoppingCart,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LanguageFlag } from "@/components/layout/LanguageFlag";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useLanguage } from "@/i18n/LanguageProvider";
import { locales } from "@/i18n/translations";
import { useCartStore } from "@/store/cart";
import { categories } from "@/lib/categories";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { t, locale, setLocale } = useLanguage();
  const cartCount = useCartStore((state) =>
    state.items.reduce((count, item) => count + item.quantity, 0)
  );

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden bg-[#0B1F3A] text-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[11px] sm:px-6">
          <p className="inline-flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            {t("header.announcement")}
          </p>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-2">
            <Link href="/" className="flex shrink-0 items-center" onClick={closeMenu}>
              <Image
                src="/logo.svg"
                alt="TicketHub"
                width={180}
                height={63}
                priority
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={t("nav.menu")}
                aria-expanded={menuOpen}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto hidden h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 md:flex">
          <Link href="/" className="flex shrink-0 items-center" onClick={closeMenu}>
            <Image
              src="/logo.svg"
              alt="TicketHub"
              width={180}
              height={63}
              priority
              className="h-9 w-auto lg:h-10"
            />
          </Link>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <NotificationBell />

            <Link
              href="/cart"
              aria-label={t("nav.cart")}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t("nav.menu")}
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="absolute right-4 top-full z-50 mt-2 max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl sm:right-6 dark:border-slate-800 dark:bg-slate-900">
            <nav className="flex flex-col py-1">
              <MenuLink href="/" onClick={closeMenu} icon={<Home className="h-4 w-4" />}>
                {t("nav.home")}
              </MenuLink>
              <MenuLink href="/events" onClick={closeMenu} icon={<CalendarDays className="h-4 w-4" />}>
                {t("nav.events")}
              </MenuLink>
              <MenuLink href="/cart" onClick={closeMenu} icon={<ShoppingCart className="h-4 w-4" />}>
                {t("nav.cart")}
                {cartCount > 0 && (
                  <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </MenuLink>

              <SectionLabel>{t("nav.categories")}</SectionLabel>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <MenuLink
                    key={category.slug}
                    href={`/events?category=${encodeURIComponent(category.slug)}`}
                    onClick={closeMenu}
                    icon={<Icon className="h-4 w-4" />}
                  >
                    {t(category.labelKey)}
                  </MenuLink>
                );
              })}

              <SectionLabel>{t("nav.account")}</SectionLabel>
              {session ? (
                <>
                  {session.user?.isAdmin && (
                    <MenuLink href="/admin/events" onClick={closeMenu}>
                      {t("nav.admin")}
                    </MenuLink>
                  )}
                  <MenuLink href="/account" onClick={closeMenu}>{t("nav.account")}</MenuLink>
                  <MenuLink href="/orders" onClick={closeMenu}>{t("nav.orders")}</MenuLink>
                  <MenuLink href="/notifications" onClick={closeMenu}>{t("nav.notifications")}</MenuLink>
                  <MenuLink href="/settings" onClick={closeMenu}>{t("nav.settings")}</MenuLink>
                  <button
                    onClick={() => {
                      closeMenu();
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-2 py-2">
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="outline" size="sm" className="w-full">
                      <LogIn className="mr-1.5 h-4 w-4" />
                      {t("nav.signin")}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMenu}>
                    <Button size="sm" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                      {t("nav.signup")}
                    </Button>
                  </Link>
                </div>
              )}

              <SectionLabel>{t("nav.language")}</SectionLabel>
              <div className="grid grid-cols-2 gap-1.5 px-2 py-1">
                {locales.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLocale(l.code);
                      closeMenu();
                    }}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm font-medium transition ${
                      l.code === locale
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-300"
                        : "border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <LanguageFlag code={l.code} />
                    <span className="truncate">{l.native}</span>
                    {l.code === locale && <Check className="ml-auto h-4 w-4" />}
                  </button>
                ))}
              </div>

              <SectionLabel>{t("nav.help")}</SectionLabel>
              <MenuLink href="/guide" onClick={closeMenu}>{t("nav.guide")}</MenuLink>
              <MenuLink href="/contact-us" onClick={closeMenu}>{t("home.contact")}</MenuLink>
              <MenuLink href="/privacy" onClick={closeMenu}>{t("home.privacy")}</MenuLink>
              <MenuLink href="/user-agreement" onClick={closeMenu}>{t("home.agreement")}</MenuLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuLink({
  href,
  onClick,
  icon,
  children,
}: {
  href: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      <span className="flex items-center gap-2.5">
        {icon}
        {children}
      </span>
      <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-300" />
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {children}
    </p>
  );
}
