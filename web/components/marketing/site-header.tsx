import Link from "next/link";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggleIcon } from "@/components/theme-toggle";
import { repositoryUrl } from "@/lib/env";

export function SiteHeader() {
  return (
    <header className="border-b-[1.5px] border-line-strong">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/docs"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink sm:block"
          >
            Docs
          </Link>
          <Link
            href="/faq"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink lg:block"
          >
            FAQ
          </Link>
          <a
            href={repositoryUrl}
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink sm:block"
          >
            GitHub
          </a>
          <ThemeToggleIcon className="hidden sm:block" />
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <ButtonLink href="/signup" size="sm">
            Start tracking
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-[1.5px] border-line-strong">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          <Logo />
          <p className="text-sm text-muted">See what matters. Ignore the noise.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
            <li>
              <Link href="/docs" className="hover:text-ink">
                Documentation
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-ink">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/alternatives" className="hover:text-ink">
                Comparisons
              </Link>
            </li>
            <li>
              <Link href="/docs/privacy" className="hover:text-ink">
                Privacy model
              </Link>
            </li>
            <li>
              <Link href="/docs/self-hosting" className="hover:text-ink">
                Self-hosting
              </Link>
            </li>
            <li>
              <a href={repositoryUrl} className="hover:text-ink">
                GitHub
              </a>
            </li>
            <li>
              <a href={`${repositoryUrl}/blob/main/LICENSE`} className="hover:text-ink">
                MIT License
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
