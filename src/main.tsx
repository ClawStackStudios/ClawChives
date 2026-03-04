import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { DatabaseProvider } from './services/database/DatabaseProvider.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DatabaseProvider>
      <ThemeProvider defaultTheme="auto" storageKey="cc_theme">
        <App />
      </ThemeProvider>
    </DatabaseProvider>
  </React.StrictMode>,
)
