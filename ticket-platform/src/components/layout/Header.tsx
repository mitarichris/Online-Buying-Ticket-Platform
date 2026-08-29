"use client";

import Link from "next/link";
import { Ticket, Menu, X, Home, CalendarDays, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";

const categories = [
  { slug: "Movies", key: "home.row.movies" },
  { slug: "Sports", key: "home.row.sports" },
  { slug: "Festivals", key: "home.row.music" },
  { slug: "Theater", key: "home.row.theater" },
  { slug: "Conference", key: "home.row.conferences" },
  { slug: "Exhibitions", key: "home.row.expos" },
  { slug: "Comedy", key: "home.row.comedy" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-[#101114]/90">
      <div className="relative flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <Ticket className="h-6 w-6 text-[#1dd171]" />
          <span>TicketHub</span>
        </Link>

        <div className="hidden flex-1 justify-center px-8 md:flex">
          <div className="w-full max-w-md">
            <HeaderSearch />
          </div>
        </div>

        <nav className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/events"
            className="hidden text-sm font-medium text-gray-600 transition hover:text-gray-900 md:inline dark:text-white/70 dark:hover:text-white"
          >
            {t("nav.events")}
          </Link>

          <LanguageSwitcher />

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="absolute right-4 top-full z-50 mt-2 max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl sm:right-6 dark:border-white/10 dark:bg-[#171a20]">
            <div className="px-2 pt-2 md:hidden">
              <HeaderSearch onSearch={() => setMenuOpen(false)} />
            </div>

            <nav className="flex flex-col py-1">
              <MenuLink href="/" onClick={() => setMenuOpen(false)} icon={<Home className="h-4 w-4" />}>
                {t("nav.home")}
              </MenuLink>
              <MenuLink href="/events" onClick={() => setMenuOpen(false)} icon={<CalendarDays className="h-4 w-4" />}>
                {t("nav.events")}
              </MenuLink>

              <SectionLabel>{t("nav.categories")}</SectionLabel>
              {categories.map((c) => (
                <MenuLink
                  key={c.slug}
                  href={`/events?category=${encodeURIComponent(c.slug)}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(c.key)}
                </MenuLink>
              ))}

              <SectionLabel>{t("nav.account")}</SectionLabel>
              {session ? (
                <>
                  <MenuLink href="/account" onClick={() => setMenuOpen(false)}>{t("nav.account")}</MenuLink>
                  <MenuLink href="/orders" onClick={() => setMenuOpen(false)}>{t("nav.orders")}</MenuLink>
                  <MenuLink href="/notifications" onClick={() => setMenuOpen(false)}>{t("nav.notifications")}</MenuLink>
                  <MenuLink href="/settings" onClick={() => setMenuOpen(false)}>{t("nav.settings")}</MenuLink>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/80 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-2 py-2">
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">{t("nav.signin")}</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-[#1dd171] text-[#062b17] hover:bg-[#17b862]">
                      {t("nav.signup")}
                    </Button>
                  </Link>
                </div>
              )}

              <SectionLabel>{t("nav.help")}</SectionLabel>
              <MenuLink href="/contact-us" onClick={() => setMenuOpen(false)}>{t("home.contact")}</MenuLink>
              <MenuLink href="/privacy" onClick={() => setMenuOpen(false)}>{t("home.privacy")}</MenuLink>
              <MenuLink href="/user-agreement" onClick={() => setMenuOpen(false)}>{t("home.agreement")}</MenuLink>
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
      className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/80 dark:hover:bg-white/5 dark:hover:text-white"
    >
      <span className="flex items-center gap-2.5">
        {icon}
        {children}
      </span>
      <ChevronRight className="h-4 w-4 text-gray-400 transition group-hover:text-gray-600 dark:text-white/30 dark:group-hover:text-white/70" />
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">
      {children}
    </p>
  );
}
