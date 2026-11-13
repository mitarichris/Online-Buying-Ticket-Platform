import type { Locale } from "@/i18n/translations";

interface LanguageFlagProps {
  code: Locale;
  className?: string;
}

export function LanguageFlag({ code, className = "h-4 w-6" }: LanguageFlagProps) {
  const svgProps = {
    viewBox: "0 0 60 40",
    className: `${className} shrink-0 rounded-[3px] ring-1 ring-black/10`,
    "aria-hidden": true,
    focusable: false,
  } as const;

  switch (code) {
    case "fr":
      return (
        <svg {...svgProps}>
          <rect width="60" height="40" fill="#ffffff" />
          <rect width="20" height="40" fill="#002395" />
          <rect x="40" width="20" height="40" fill="#ED2939" />
        </svg>
      );
    case "rw":
      return (
        <svg {...svgProps}>
          <rect width="60" height="40" fill="#00A1DE" />
          <rect y="20" width="60" height="10" fill="#FAD201" />
          <rect y="30" width="60" height="10" fill="#20603D" />
          <g fill="#E5BE01">
            <circle cx="48" cy="11" r="3.2" />
          </g>
          <g stroke="#E5BE01" strokeWidth="1.4" strokeLinecap="round">
            <line x1="52.6" y1="11" x2="54.8" y2="11" />
            <line x1="51.25" y1="14.25" x2="52.81" y2="15.81" />
            <line x1="48" y1="15.6" x2="48" y2="17.8" />
            <line x1="44.75" y1="14.25" x2="43.19" y2="15.81" />
            <line x1="43.4" y1="11" x2="41.2" y2="11" />
            <line x1="44.75" y1="7.75" x2="43.19" y2="6.19" />
            <line x1="48" y1="6.4" x2="48" y2="4.2" />
            <line x1="51.25" y1="7.75" x2="52.81" y2="6.19" />
          </g>
        </svg>
      );
    case "sw":
      return (
        <svg {...svgProps}>
          <rect width="60" height="40" fill="#1EB53A" />
          <path d="M60 0 L60 40 L0 40 Z" fill="#00A3DD" />
          <path d="M0 40 L60 0" stroke="#FCD116" strokeWidth="12" />
          <path d="M0 40 L60 0" stroke="#000000" strokeWidth="7" />
        </svg>
      );
    case "en":
    default:
      return (
        <svg {...svgProps}>
          <rect width="60" height="40" fill="#012169" />
          <path d="M0 0 L60 40 M60 0 L0 40" stroke="#ffffff" strokeWidth="8" />
          <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" strokeWidth="4" />
          <path d="M30 0 V40 M0 20 H60" stroke="#ffffff" strokeWidth="13" />
          <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth="8" />
        </svg>
      );
  }
}
