import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/**
 * Supported UI themes for the application.
 */
type Theme = 'light' | 'dark';

/**
 * The values exposed by the theme context.
 */
type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

/**
 * Create a context.
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Returns the initial theme based on the saved preference or the user's system preference.
 */
function getInitialTheme(): Theme {
  const stored = localStorage.getItem('ft_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Create a provider component that will wrap the app and provide the theme context to all components.
 * Here {children} is object destructuring, otherwise it would be {props.children}.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  /**
   * A state variable is created to hold the current theme, and a function to toggle the theme.
   */
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  /**
   * The useEffect hook is used to update the document's class list and localStorage whenever the theme changes.
   */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('ft_theme', theme);
  }, [theme]);

  /**
   * Toggle the theme between 'light' and 'dark'. The setTheme function is called with a callback that receives the current theme and returns the opposite theme.
   */
  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  /**
   * Pass the current theme and the toggle function to the context provider's value prop, so that any component that consumes this context can access them.
   */
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Returns the theme context value from within a ThemeProvider.
 *
 * @throws Error if used outside of ThemeProvider.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}