import { Facebook, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
    </svg>
  );
}

export type SiteSocial = {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
};

export function WhatsAppIcon({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02Zm-7.01 15.24h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.83c0 4.55-3.7 8.23-8.25 8.23Zm4.51-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.64.8-.79.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}

const FALLBACK = [
  { key: "instagram" as const, label: "Instagram", icon: Instagram, hideIfEmpty: false },
  { key: "facebook" as const, label: "Facebook", icon: Facebook, hideIfEmpty: false },
  { key: "twitter" as const, label: "X", icon: XIcon, hideIfEmpty: false },
  { key: "whatsapp" as const, label: "WhatsApp kanalı", icon: WhatsAppIcon, hideIfEmpty: true },
] as const;

export function listSiteSocial(social?: SiteSocial) {
  return FALLBACK.map((item) => ({
    ...item,
    href: social?.[item.key]?.trim() || "",
  })).filter((item) => item.href || !item.hideIfEmpty);
}

/** Hamburger: yalnızca ikon, yan yana. URL yoksa görünür (tıklanmaz). */
export function SiteSocialMenu({ social }: { social?: SiteSocial }) {
  const items = listSiteSocial(social);

  return (
    <div className="border-t border-neutral-200 px-5 py-4">
      <ul className="flex items-center justify-center gap-5">
        {items.map((item) => {
          const Icon = item.icon;
          const iconCls = "h-6 w-6";
          if (!item.href) {
            return (
              <li key={item.label}>
                <span className="text-neutral-400" aria-label={item.label}>
                  <Icon className={iconCls} strokeWidth={1.75} />
                </span>
              </li>
            );
          }
          return (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="text-neutral-800 hover:text-[var(--brand)]"
              >
                <Icon className={iconCls} strokeWidth={1.75} />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SiteSocialLinks({
  variant = "light",
  size = "md",
  social,
}: {
  variant?: "light" | "dark";
  size?: "sm" | "md";
  social?: SiteSocial;
}) {
  const icon = size === "sm" ? "h-4 w-4" : "h-[22px] w-[22px]";
  const items = FALLBACK.map((item) => ({
    ...item,
    href: social?.[item.key] || "",
  })).filter((item) => item.href);

  if (items.length === 0) return null;

  return (
    <div className={cn("flex items-center", size === "sm" ? "gap-3.5" : "gap-5")}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.label}
            href={item.href}
            aria-label={item.label}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "transition-opacity hover:opacity-70",
              variant === "dark" ? "text-white" : "text-neutral-800 hover:text-[var(--brand)]"
            )}
          >
            <Icon className={icon} strokeWidth={1.6} />
          </a>
        );
      })}
    </div>
  );
}
