import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold select-none " +
  "transition-[transform,box-shadow,background-color,color,border-color] duration-150 ease-out " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent border-[1.5px] border-ink shadow-hard " +
    "hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_var(--shadow)] " +
    "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  secondary:
    "bg-surface text-ink border-[1.5px] border-ink shadow-hard-sm " +
    "hover:bg-sunken active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  ghost: "text-ink-2 hover:text-ink hover:bg-sunken border-[1.5px] border-transparent",
  danger:
    "bg-danger text-white border-[1.5px] border-ink shadow-hard-sm " +
    "hover:brightness-110 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
