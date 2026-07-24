import { ThemeProvider, CssBaseline } from '@mui/material';
import { RouterProvider } from 'react-router';
import { getAppTheme } from './theme';
import { router } from './router';
import { ThemeToggleContext } from './context/ThemeToggleContext';

function App() {
  const themeMode = 'light';
  const theme = getAppTheme(themeMode);
  const toggleTheme = () => {};

  return (
    <ThemeToggleContext.Provider value={{ themeMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ThemeToggleContext.Provider>
  );
}

export default App;
