"use client";

import { FC, useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export const WalletButton: FC = () => {
  const { publicKey, wallet, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = () => {
    if (publicKey) {
      setShowMenu(!showMenu);
    } else {
      setVisible(true);
    }
  };

  const truncatedAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleClick}
        className="px-4 py-2 border border-terminal text-terminal glow uppercase text-sm
          hover:bg-[#33ff00] hover:text-[#0a0a0a] hover:border-[#33ff00] transition-all duration-150"
      >
        {connecting ? (
          <span className="animate-blink">[ CONNECTING... ]</span>
        ) : publicKey ? (
          <span>[ {truncatedAddress} ]</span>
        ) : (
          <span>[ CONNECT WALLET ]</span>
        )}
      </button>

      {showMenu && publicKey && (
        <div className="absolute right-0 mt-1 border border-terminal bg-terminal z-50 min-w-[200px]">
          <div className="px-3 py-2 border-b border-terminal text-terminal-muted text-xs uppercase">
            +--- WALLET ---+
          </div>
          <div className="px-3 py-2 text-terminal text-xs font-mono break-all border-b border-terminal">
            {publicKey.toBase58()}
          </div>
          {wallet && (
            <div className="px-3 py-2 text-terminal-muted text-xs border-b border-terminal">
              via {wallet.adapter.name}
            </div>
          )}
          <button
            onClick={() => {
              disconnect();
              setShowMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-terminal-error hover:bg-[#ff3333] hover:text-[#0a0a0a] transition-colors text-sm uppercase"
          >
            [ DISCONNECT ]
          </button>
        </div>
      )}
    </div>
  );
};
