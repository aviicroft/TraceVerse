'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface TechnicalValueProps {
  value: string;
  truncate?: boolean;
  prefixLength?: number;
  suffixLength?: number;
  copyable?: boolean;
  explorerUrl?: string;
  className?: string;
}

export const TechnicalValue: React.FC<TechnicalValueProps> = ({
  value,
  truncate = true,
  prefixLength = 8,
  suffixLength = 6,
  copyable = true,
  explorerUrl,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const displayValue =
    truncate && value.length > prefixLength + suffixLength
      ? `${value.slice(0, prefixLength)}...${value.slice(-suffixLength)}`
      : value;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-technical ${className}`}>
      <span className="truncate select-all text-text font-medium" title={value}>
        {displayValue}
      </span>

      {copyable && (
        <button
          onClick={handleCopy}
          aria-label="Copy to clipboard"
          title="Copy to clipboard"
          className="p-1 rounded hover:bg-surface-raised text-text-muted hover:text-text transition-colors shrink-0"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-verified" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      )}

      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="View on block explorer"
          className="p-1 rounded hover:bg-surface-raised text-text-muted hover:text-accent transition-colors shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </span>
  );
};
