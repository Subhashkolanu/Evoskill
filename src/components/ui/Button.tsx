import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'forest' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#C66E4E] hover:bg-[#B35D3E] text-white shadow-sm border border-[#C66E4E]/30',
      forest: 'bg-[#263A32] hover:bg-[#1A2822] text-[#F4F0E6] shadow-sm border border-[#263A32]/40',
      secondary: 'bg-[var(--surface)] hover:bg-[var(--surface-warm)] text-[var(--text-primary)] border border-[var(--border)] shadow-xs',
      outline: 'bg-transparent hover:bg-[var(--surface-warm)] text-[var(--text-primary)] border border-[var(--border)]',
      ghost: 'bg-transparent hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border-transparent',
      danger: 'bg-red-700/10 hover:bg-red-700/20 text-red-700 dark:text-red-400 border border-red-700/20'
    };

    const sizes = {
      sm: 'py-1.5 px-3 text-xs font-semibold rounded-lg',
      md: 'py-2.5 px-4 text-sm font-semibold rounded-xl',
      lg: 'py-3.5 px-6 text-base font-bold rounded-xl'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
