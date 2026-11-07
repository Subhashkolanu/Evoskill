import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'forest' | 'terracotta' | 'gold' | 'sage' | 'slate' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ 
  className, 
  variant = 'sage', 
  size = 'md',
  children, 
  ...props 
}: BadgeProps) {
  const variants = {
    forest: 'bg-[#263A32]/10 text-[#263A32] dark:bg-[#263A32]/30 dark:text-[#E0E8E4] border border-[#263A32]/20',
    terracotta: 'bg-[#C66E4E]/10 text-[#B35D3E] dark:bg-[#C66E4E]/25 dark:text-[#F1B9A5] border border-[#C66E4E]/20',
    gold: 'bg-[#D6AE57]/15 text-[#8F6C1E] dark:bg-[#D6AE57]/25 dark:text-[#F3DFB0] border border-[#D6AE57]/30',
    sage: 'bg-[#829A91]/15 text-[#375249] dark:bg-[#829A91]/25 dark:text-[#C5D5CF] border border-[#829A91]/30',
    slate: 'bg-[#343D50]/10 text-[#343D50] dark:bg-[#343D50]/30 dark:text-[#C5CFE0] border border-[#343D50]/20',
    outline: 'bg-transparent text-[var(--text-secondary)] border border-[var(--border)]'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-md',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
