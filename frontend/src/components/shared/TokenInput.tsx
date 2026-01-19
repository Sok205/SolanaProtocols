// src/components/shared/TokenInput.tsx
"use client";

import { ChangeEvent } from "react";

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
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm text-gray-400">{label}</label>
        {balance && (
          <span className="text-xs text-gray-500">
            Balance: {balance} {symbol}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="0.0"
          className="flex-1 bg-transparent text-2xl font-mono outline-none disabled:text-gray-500"
        />
        {symbol && (
          <span className="text-lg font-medium text-gray-300">{symbol}</span>
        )}
      </div>
    </div>
  );
}
