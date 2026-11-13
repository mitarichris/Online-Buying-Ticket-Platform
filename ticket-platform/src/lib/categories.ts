import {
  BriefcaseBusiness,
  Film,
  Flag,
  Laugh,
  Music2,
  Store,
  Theater,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface CategoryDef {
  slug: string;
  labelKey: string;
  icon: LucideIcon;
  match: string[];
  tint: string;
}

export const categories: CategoryDef[] = [
  {
    slug: "Sports",
    labelKey: "home.row.sports",
    icon: Trophy,
    match: ["sport"],
    tint: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    slug: "Festivals",
    labelKey: "home.row.music",
    icon: Music2,
    match: ["festival", "music"],
    tint: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
  {
    slug: "Comedy",
    labelKey: "home.row.comedy",
    icon: Laugh,
    match: ["comedy"],
    tint: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    slug: "Theater",
    labelKey: "home.row.theater",
    icon: Theater,
    match: ["theat"],
    tint: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  },
  {
    slug: "Conference",
    labelKey: "home.row.conferences",
    icon: BriefcaseBusiness,
    match: ["conference"],
    tint: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  },
  {
    slug: "Exhibitions",
    labelKey: "home.row.expos",
    icon: Store,
    match: ["exhib", "expo"],
    tint: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    slug: "Races",
    labelKey: "home.row.races",
    icon: Flag,
    match: ["race"],
    tint: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  {
    slug: "Movies",
    labelKey: "home.row.movies",
    icon: Film,
    match: ["movie", "cinema"],
    tint: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
];

export function matchesCategory(
  category: string | undefined,
  genre: string | undefined,
  slug: string
): boolean {
  const def = categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (!def) return false;
  const haystack = `${category ?? ""} ${genre ?? ""}`.toLowerCase();
  return def.match.some((token) => haystack.includes(token));
}
