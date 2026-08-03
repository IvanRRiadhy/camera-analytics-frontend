import { createContext, useContext } from 'react';

export interface ThemeToggleContextType {
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeToggleContext = createContext<ThemeToggleContextType>({
  themeMode: 'dark',
  toggleTheme: () => {},
});

export const useThemeToggle = () => useContext(ThemeToggleContext);
