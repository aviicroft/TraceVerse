'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  leftIcon,
  rightIcon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const effectiveLeftIcon = leftIcon || (icon && iconPosition === 'left' ? icon : null);
  const effectiveRightIcon = rightIcon || (icon && iconPosition === 'right' ? icon : null);

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-accent hover:bg-accent-hover text-white font-medium border border-accent shadow-sm active:translate-y-[1px]',
    secondary:
      'bg-surface-raised hover:bg-surface-hover text-text font-medium border border-border shadow-sm active:translate-y-[1px]',
    outline:
      'bg-transparent hover:bg-surface-raised text-text font-medium border border-border active:translate-y-[1px]',
    danger:
      'bg-danger hover:bg-danger-hover text-white font-medium border border-danger shadow-sm active:translate-y-[1px]',
    ghost:
      'bg-transparent hover:bg-surface-raised text-text-secondary hover:text-text font-medium border-transparent',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-8 px-2.5 text-xs rounded-lg gap-1.5',
    md: 'h-9 px-3.5 text-xs rounded-lg gap-2',
    lg: 'h-10 px-4 text-sm rounded-lg gap-2',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        effectiveLeftIcon && <span className="shrink-0">{effectiveLeftIcon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && effectiveRightIcon && <span className="shrink-0">{effectiveRightIcon}</span>}
    </button>
  );
};
