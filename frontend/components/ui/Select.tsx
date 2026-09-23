'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface CustomSelectProps<T = string | number> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  prefix?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

export function CustomSelect<T extends string | number>({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select option...',
  prefix,
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  disabled = false,
  align = 'left',
  size = 'md',
  ariaLabel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const selectId = useId();

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedIndex = options.findIndex((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync highlighted index when opening
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, selectedIndex]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listboxRef.current && highlightedIndex >= 0) {
      const item = listboxRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            onChange(options[highlightedIndex].value);
            setIsOpen(false);
            triggerRef.current?.focus();
          }
        } else {
          setIsOpen(true);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;

      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
        }
        break;
    }
  };

  const sizeClasses = {
    sm: 'min-h-[36px] sm:min-h-[32px] px-2.5 py-1.5 text-xs',
    md: 'min-h-[44px] sm:min-h-[38px] px-3.5 py-2 text-xs sm:text-xs',
    lg: 'min-h-[48px] px-4 py-3 text-xs sm:text-sm',
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left w-full sm:w-auto ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={selectId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || label || (selectedOption ? selectedOption.label : placeholder)}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full inline-flex items-center justify-between gap-2.5 rounded-xl border font-sans font-medium transition-all select-none cursor-pointer text-left ${
          sizeClasses[size]
        } ${
          isOpen
            ? 'bg-[#162D55] text-[#F8FAFC] border-[#E63946] ring-2 ring-[#E63946]/30 shadow-md'
            : 'bg-[#102347] hover:bg-[#162D55] text-[#F8FAFC] border-[#29436B] hover:border-[#3C5C89] shadow-sm'
        } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {prefix && <span className="text-[#94A3B8] shrink-0">{prefix}</span>}
          {label && <span className="text-[#94A3B8] font-normal shrink-0">{label}</span>}
          <span className="truncate text-[#F8FAFC] font-semibold">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-[#94A3B8] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#E63946]' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Options Popup */}
      {isOpen && (
        <div
          className={`absolute mt-1.5 z-50 w-full sm:min-w-[200px] max-w-[calc(100vw-24px)] rounded-xl bg-[#102347] border border-[#29436B] shadow-2xl overflow-hidden focus:outline-none animate-in fade-in-0 zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${dropdownClassName}`}
        >
          <ul
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={selectId}
            className="max-h-60 overflow-y-auto py-1 scrollbar-none divide-y divide-[#1D355A]/50"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={String(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`relative cursor-pointer select-none px-3.5 py-2.5 sm:py-2 text-xs transition-colors flex items-center justify-between gap-3 min-h-[44px] sm:min-h-[38px] ${
                    isSelected
                      ? 'bg-[rgba(230,57,70,0.18)] text-white font-semibold border-l-2 border-[#E63946]'
                      : isHighlighted
                      ? 'bg-[#1C3763] text-[#F8FAFC]'
                      : 'text-[#F8FAFC] hover:bg-[#162D55]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <span className={`shrink-0 ${isSelected ? 'text-[#E63946]' : 'text-[#94A3B8]'}`}>
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 text-[#E63946] shrink-0" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
