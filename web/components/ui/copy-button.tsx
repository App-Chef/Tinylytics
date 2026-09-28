"use client";

import { useState } from "react";
import { buttonClass } from "./button";

export function CopyButton({
  value,
  label = "Copy",
  variant = "secondary",
  size = "sm",
}: {
  value: string;
  label?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 1800);
  }

  return (
    <button type="button" onClick={copy} className={buttonClass(variant, size, "min-w-24")}>
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Press Ctrl+C" : label}</span>
    </button>
  );
}
