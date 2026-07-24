import { createContext, useContext } from 'react';

export interface ThemeToggleContextType {
  themeMode: 'light';
  toggleTheme: () => void;
}

export const ThemeToggleContext = createContext<ThemeToggleContextType>({
  themeMode: 'light',
  toggleTheme: () => {},
});

export const useThemeToggle = () => useContext(ThemeToggleContext);
