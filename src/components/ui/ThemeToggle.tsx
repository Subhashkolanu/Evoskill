import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark') || 
      localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={`p-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-warm)] transition-colors cursor-pointer shadow-xs ${className || ''}`}
      title={isDark ? 'Switch to Warm Ivory Light Mode' : 'Switch to Forest Dark Mode'}
      aria-label="Toggle visual theme"
    >
      {isDark ? <Sun className="w-4 h-4 text-[#D6AE57]" /> : <Moon className="w-4 h-4 text-[#263A32]" />}
    </button>
  );
}
