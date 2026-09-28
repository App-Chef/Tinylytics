"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="flex min-h-[60dvh] flex-col items-start justify-center gap-5 px-6 sm:px-16">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Something went wrong.</h1>
        <p className="mt-2 max-w-md text-ink-2">
          We couldn&apos;t load this page. Check your connection and try again.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
