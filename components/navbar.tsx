import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white">
            A
          </span>
          <span className="truncate text-sm font-semibold tracking-tight text-ink">
            Aria
          </span>
        </Link>

        <Link
          href="/chat"
          className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Start Chat
        </Link>
      </div>
    </header>
  );
}
