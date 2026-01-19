"use client";

import { ReactNode } from "react";

type StatusType = "ok" | "error" | "wait" | "none";

interface TerminalWindowProps {
  title: string;
  status?: StatusType;
  children: ReactNode;
  className?: string;
}

function StatusBadge({ status }: { status: StatusType }) {
  switch (status) {
    case "ok":
      return <span className="text-terminal glow">[OK]</span>;
    case "error":
      return <span className="text-terminal-error glow-error">[ERR]</span>;
    case "wait":
      return <span className="text-terminal-amber glow-amber animate-blink">[WAIT]</span>;
    case "none":
    default:
      return null;
  }
}

export function TerminalWindow({ title, status = "none", children, className = "" }: TerminalWindowProps) {
  const titleWithStatus = status !== "none"
    ? `${title} `
    : title;

  return (
    <div className={`border border-terminal ${className}`}>
      {/* Title bar */}
      <div className="border-b border-terminal px-3 py-2 flex items-center justify-between">
        <span className="uppercase text-sm glow">
          +--- {titleWithStatus}
          {status !== "none" && <StatusBadge status={status} />}
          {" "}---+
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
