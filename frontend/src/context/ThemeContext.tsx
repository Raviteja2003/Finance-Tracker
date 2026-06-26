import { createContext, useContext, useEffect, useState } from 'react';

// Deliberately NOT in Redux. Theme is local, UI-only state with exactly
// one consumer concern (which CSS class is on <html>) and nothing else
// in the app needs to react to it or coordinate around it. That's the
// signature of a good Context use case, in contrast to filtersSlice
// which is genuinely cross-cutting. See filtersSlice.js for the contrast.
const ThemeContext = createContext(undefined);

function getInitialTheme() {
  const stored = localStorage.getItem('ft_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('ft_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}