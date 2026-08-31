import React, { useEffect, useState } from 'react';

export default function ThemeToggle({ id = "theme-toggle", className = "" }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('placementai-theme');
    // Default to dark mode if not set
    return saved !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('placementai-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('placementai-theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      id={id}
      onClick={() => setIsDark(!isDark)}
      className={`p-2.5 rounded-xl border border-theme hover:bg-secondary text-primary transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        /* Sun Icon (Click for Light Mode) */
        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" strokeWidth="2"/>
          <path strokeWidth="2" strokeLinecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        /* Moon Icon (Click for Dark Mode) */
        <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
    </button>
  );
}
