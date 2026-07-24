import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { loadRuntimeConfig } from './config'
import { initializeAxiosBaseURL } from './utils/axios'
import './index.css'
import App from './App.tsx'

// Create a QueryClient with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Load runtime config before rendering the React tree
loadRuntimeConfig()
  .then(() => {
    initializeAxiosBaseURL();
  })
  .catch((err) => {
    console.warn('Failed to load config.json, using defaults:', err);
  })
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </StrictMode>,
    );
  });
