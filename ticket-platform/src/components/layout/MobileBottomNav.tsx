"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Plus, ShoppingCart, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCartStore } from "@/store/cart";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const cartCount = useCartStore((state) =>
    state.items.reduce((count, item) => count + item.quantity, 0)
  );

  const accountHref = session ? "/account" : "/login";

  const items = [
    { href: "/", icon: Home, label: t("nav.home"), match: (p: string) => p === "/" },
    {
      href: "/events",
      icon: CalendarDays,
      label: t("nav.events"),
      match: (p: string) => p.startsWith("/events"),
    },
    {
      href: "/cart",
      icon: ShoppingCart,
      label: t("nav.cart"),
      badge: cartCount,
      match: (p: string) => p.startsWith("/cart"),
    },
    {
      href: accountHref,
      icon: User,
      label: t("nav.account"),
      match: (p: string) => p.startsWith("/account") || p.startsWith("/login"),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/95">
      <div className="grid grid-cols-5 items-end">
        {items.slice(0, 2).map((item) => (
          <NavItem key={item.href} {...item} active={item.match(pathname)} />
        ))}

        <div className="flex justify-center">
          <Link
            href="/events"
            aria-label={t("nav.getTicket")}
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 ring-4 ring-white transition-transform hover:scale-105 active:scale-95 dark:ring-slate-950"
          >
            <Plus className="h-7 w-7" />
          </Link>
        </div>

        {items.slice(2).map((item) => (
          <NavItem key={item.href} {...item} active={item.match(pathname)} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  badge,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
        active
          ? "text-blue-600 dark:text-blue-400"
          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      }`}
    >
      <span className="relative">
        <Icon className="h-5 w-5" />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
