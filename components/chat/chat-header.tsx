import Link from "next/link";

export function ChatHeader() {
  return (
    <header className="flex items-center gap-3 border-b border-[#EEE8F4] bg-white px-4 py-3">
      <Link
        href="/"
        aria-label="Back to home"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-lavender hover:text-ink"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="h-5 w-5"
        >
          <path
            d="M12.5 4.5 7 10l5.5 5.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lavender text-sm font-semibold text-primary">
        A
      </span>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">Aria</p>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Available
        </p>
      </div>
    </header>
  );
}
