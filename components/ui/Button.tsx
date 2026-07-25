"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLS: Record<Variant, string> = {
  // Lime hanya untuk aksi utama; hover: sedikit terang + naik 1-2px
  primary:
    "bg-lime font-semibold text-obsidian hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0",
  secondary: "border border-line bg-moss text-ivory hover:brightness-125",
  ghost: "bg-transparent text-ash hover:bg-moss hover:text-ivory",
  danger: "border border-coral/60 bg-transparent text-coral hover:bg-coral/10",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", className = "", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition disabled:pointer-events-none disabled:opacity-40 ${VARIANT_CLS[variant]} ${className}`}
        {...props}
      />
    );
  }
);

// Icon button: target sentuh minimal 40x40, wajib punya label untuk
// screen reader (aria-label) dan tooltip bawaan browser (title).
type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  danger?: boolean;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, danger, className = "", ...props }, ref) {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-ash transition hover:bg-moss disabled:pointer-events-none disabled:opacity-40 ${
          danger ? "hover:text-coral" : "hover:text-ivory"
        } ${className}`}
        {...props}
      />
    );
  }
);
