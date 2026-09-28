"use client";

import { useFormStatus } from "react-dom";
import { buttonClass } from "./button";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={buttonClass(variant, size, className)}>
      {pending ? (pendingLabel ?? "Saving…") : children}
    </button>
  );
}
