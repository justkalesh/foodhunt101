import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './hooks/queryClient';
import App from './App';

// Type declaration for custom window property
declare global {
  interface Window {
    __hideFallback?: () => void;
    __clearLoadTimer?: () => void;
    __isInAppBrowser?: boolean;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// Hide fallback UI since app loaded successfully
if (typeof window.__hideFallback === 'function') {
  window.__hideFallback();
}
// Clear diagnostic load timer
if (typeof window.__clearLoadTimer === 'function') {
  window.__clearLoadTimer();
}