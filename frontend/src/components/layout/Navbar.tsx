"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/wallet/WalletButton";

export function Navbar() {
  const pathname = usePathname();

  // Convert pathname to terminal-style path
  const getTerminalPath = () => {
    if (pathname === "/") return "~";
    return pathname.replace(/\//g, "/").replace(/^/, "~");
  };

  return (
    <nav className="border-b border-terminal bg-terminal sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left side: Prompt */}
        <Link href="/" className="flex items-center gap-2 hover:no-underline group">
          <span className="text-terminal glow">
            <span className="text-terminal-amber">user</span>
            <span className="text-terminal-muted">@</span>
            <span className="text-terminal">solana</span>
            <span className="text-terminal-muted">:</span>
            <span className="text-terminal">{getTerminalPath()}</span>
            <span className="text-terminal-muted">$</span>
          </span>
          <span className="w-2 h-4 bg-terminal animate-blink" />
        </Link>

        {/* Right side: Wallet */}
        <WalletButton />
      </div>
    </nav>
  );
}
