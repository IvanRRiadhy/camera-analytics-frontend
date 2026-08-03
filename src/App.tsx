import { ThemeProvider, CssBaseline } from '@mui/material';
import { RouterProvider } from 'react-router';
import { getAppTheme } from './theme';
import { router } from './router';
import { ThemeToggleContext } from './context/ThemeToggleContext';
import { SignalRProvider } from './context/SignalRContext';

function App() {
  const themeMode = 'dark';
  const theme = getAppTheme('dark');
  const toggleTheme = () => {};

  return (
    <ThemeToggleContext.Provider value={{ themeMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SignalRProvider>
          <RouterProvider router={router} />
        </SignalRProvider>
      </ThemeProvider>
    </ThemeToggleContext.Provider>
  );
}

export default App;
