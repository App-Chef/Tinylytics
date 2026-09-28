import type { ComponentProps, ReactNode } from "react";

const control =
  "w-full rounded-md border-[1.5px] border-line-strong bg-surface px-3 text-[15px] text-ink " +
  "placeholder:text-muted transition-[box-shadow,border-color] duration-150 ease-out " +
  "focus:outline-none focus-visible:outline-none focus:shadow-[0_0_0_3px_var(--accent-wash)] focus:border-accent " +
  "aria-[invalid=true]:border-danger disabled:opacity-60";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${control} h-11 ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${control} h-11 appearance-auto ${className}`} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormMessage({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        "rounded-md border-[1.5px] px-3 py-2 text-sm " +
        (tone === "error" ? "border-danger bg-danger-wash text-danger" : "border-good text-good")
      }
    >
      {children}
    </p>
  );
}
