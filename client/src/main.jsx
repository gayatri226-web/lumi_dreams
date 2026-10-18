import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import App from './App.jsx';
import './styles/global.css';

// The single-file preview has no real URL paths, so it keeps routes in memory.
const Router = import.meta.env.VITE_PREVIEW ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProvider>
        <App />
      </AppProvider>
    </Router>
  </React.StrictMode>,
);
