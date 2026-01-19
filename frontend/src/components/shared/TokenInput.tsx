"use client";

import { ChangeEvent, useRef, useEffect, useState } from "react";

interface TokenInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  symbol?: string;
  balance?: string;
  disabled?: boolean;
}

export function TokenInput({
  label,
  value,
  onChange,
  symbol,
  balance,
  disabled = false,
}: TokenInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={`py-2 cursor-text ${disabled ? "opacity-50" : ""}`}
      onClick={handleContainerClick}
    >
      {/* Balance display */}
      {balance && (
        <div className="text-terminal-muted text-xs mb-1 pl-2">
          // balance: {balance} {symbol}
        </div>
      )}

      {/* Prompt line */}
      <div className="flex items-center gap-2">
        <span className="text-terminal-muted">&gt;</span>
        <span className="text-terminal uppercase">{label}:</span>
        <div className="flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder="0"
            className="flex-1 bg-transparent text-terminal glow outline-none disabled:text-terminal-muted min-w-0"
          />
          {isFocused && (
            <span className="w-2 h-5 bg-terminal animate-blink ml-0.5" />
          )}
          {symbol && (
            <span className="text-terminal-muted ml-2">{symbol}</span>
          )}
        </div>
      </div>
    </div>
  );
}
