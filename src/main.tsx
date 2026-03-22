import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { DatabaseProvider } from './services/database/DatabaseProvider.tsx'
import { ThemeProvider } from '@/shared/theme/theme-provider'
import { queryClient } from './services/queryClient.ts'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DatabaseProvider>
        <ThemeProvider defaultTheme="auto" storageKey="cc_theme">
          <App />
        </ThemeProvider>
      </DatabaseProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
