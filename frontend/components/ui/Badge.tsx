'use client';

import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  isMono?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
  isMono = false,
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dotColor: string }> = {
    default: {
      bg: 'bg-surface-raised',
      text: 'text-text-secondary',
      border: 'border-border',
      dotColor: 'bg-text-muted',
    },
    neutral: {
      bg: 'bg-surface-raised',
      text: 'text-text-secondary',
      border: 'border-border',
      dotColor: 'bg-text-muted',
    },
    success: {
      bg: 'bg-verified-subtle',
      text: 'text-verified',
      border: 'border-verified-border',
      dotColor: 'bg-verified',
    },
    warning: {
      bg: 'bg-warning-subtle',
      text: 'text-warning',
      border: 'border-warning-border',
      dotColor: 'bg-warning',
    },
    danger: {
      bg: 'bg-danger-subtle',
      text: 'text-danger',
      border: 'border-danger-border',
      dotColor: 'bg-danger',
    },
    info: {
      bg: 'bg-info-subtle',
      text: 'text-info',
      border: 'border-info-border',
      dotColor: 'bg-info',
    },
    accent: {
      bg: 'bg-accent-subtle',
      text: 'text-accent',
      border: 'border-accent-border',
      dotColor: 'bg-accent',
    },
  };

  const current = variantStyles[variant] || variantStyles.default;
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium leading-none ${sizeStyles} ${
        current.bg
      } ${current.text} ${current.border} ${isMono ? 'font-mono' : 'font-sans'} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dotColor} ${
            pulse ? 'animate-pulse' : ''
          }`}
        />
      )}
      {children}
    </span>
  );
};
