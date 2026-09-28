import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-start justify-center gap-6 px-6 sm:px-16">
      <Logo />
      <div>
        <p className="font-mono text-sm text-muted">404</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">Nothing here.</h1>
        <p className="mt-2 max-w-md text-ink-2">
          This page doesn&apos;t exist, or it belongs to an account you&apos;re not signed in to.
        </p>
      </div>
      <ButtonLink href="/dashboard">Go to dashboard</ButtonLink>
    </main>
  );
}
