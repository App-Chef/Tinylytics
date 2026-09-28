import type { ReactNode } from "react";

export function Panel({
  title,
  actions,
  children,
  className = "",
  titleId,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  titleId?: string;
}) {
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={`rounded-lg border-[1.5px] border-line-strong bg-surface ${className}`}
    >
      {title || actions ? (
        <header className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5 sm:px-5">
          {title ? (
            <h2 id={titleId} className="font-display text-[15px] font-bold tracking-tight">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  );
}
