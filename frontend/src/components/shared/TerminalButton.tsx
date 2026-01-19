"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "destructive";

interface TerminalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
}

export function TerminalButton({
  variant = "primary",
  loading = false,
  children,
  disabled,
  className = "",
  ...props
}: TerminalButtonProps) {
  const isDisabled = disabled || loading;

  const baseStyles = "px-4 py-2 uppercase font-medium transition-all duration-150";

  const variantStyles = {
    primary: `
      border border-terminal text-terminal glow
      hover:bg-[#33ff00] hover:text-[#0a0a0a] hover:border-[#33ff00]
      disabled:border-terminal-muted disabled:text-terminal-muted disabled:hover:bg-transparent disabled:glow-none
    `,
    secondary: `
      border border-terminal-muted text-terminal-muted
      hover:border-terminal hover:text-terminal hover:glow
      disabled:opacity-50 disabled:hover:border-terminal-muted disabled:hover:text-terminal-muted
    `,
    destructive: `
      border border-terminal-muted text-terminal-muted
      hover:bg-[#ff3333] hover:text-[#0a0a0a] hover:border-[#ff3333]
      disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-terminal-muted
    `,
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      [ {loading ? <span className="animate-blink">WAIT</span> : children} ]
    </button>
  );
}
