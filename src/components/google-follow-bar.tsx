function googleSourceUrl(host?: string) {
  const q = host?.replace(/^www\./, "") || "";
  return q
    ? `https://www.google.com/preferences/source?q=${encodeURIComponent(q)}`
    : "https://www.google.com/preferences/source";
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? "h-4 w-4 shrink-0"} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.3 21.4 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4V6.5H1.4C.5 8.2 0 10.1 0 12s.5 3.8 1.4 5.5l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.3 2.6 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
      />
    </svg>
  );
}

export function GoogleFollowBar({
  sourceHost,
  compact,
}: {
  sourceHost?: string;
  compact?: boolean;
}) {
  return (
    <a
      href={googleSourceUrl(sourceHost)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        compact
          ? "inline-flex max-w-full shrink-0 items-center gap-1.5 rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] font-semibold text-neutral-800 hover:border-black"
          : "inline-flex w-fit max-w-full items-center gap-2.5 rounded-md border border-neutral-200 bg-white px-3.5 py-2 text-[15px] font-bold leading-snug text-neutral-900 hover:border-black hover:bg-black hover:text-white"
      }
    >
      <GoogleMark className={compact ? "h-4 w-4 shrink-0" : "h-5 w-5 shrink-0"} />
      {compact ? "Google News'te takip et" : "Gündemden Haberdar olmak için bildirimleri açın"}
    </a>
  );
}
