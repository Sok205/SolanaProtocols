"use client";

type StatusType = "ok" | "error" | "wait" | "pending" | "info";

interface StatusIndicatorProps {
  status: StatusType;
  message?: string;
  className?: string;
}

export function StatusIndicator({ status, message, className = "" }: StatusIndicatorProps) {
  const configs = {
    ok: {
      badge: "[OK]",
      color: "text-terminal",
      glow: "glow",
      animate: "",
    },
    error: {
      badge: "[ERR]",
      color: "text-terminal-error",
      glow: "glow-error",
      animate: "",
    },
    wait: {
      badge: "[WAIT]",
      color: "text-terminal-amber",
      glow: "glow-amber",
      animate: "animate-blink",
    },
    pending: {
      badge: "[...]",
      color: "text-terminal-muted",
      glow: "",
      animate: "",
    },
    info: {
      badge: "[!]",
      color: "text-terminal-amber",
      glow: "glow-amber",
      animate: "",
    },
  };

  const config = configs[status];

  return (
    <span className={`${config.color} ${config.glow} ${config.animate} ${className}`}>
      {config.badge}
      {message && <span className="ml-2">{message}</span>}
    </span>
  );
}
