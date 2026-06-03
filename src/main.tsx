import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Automatically handle API requests when the app is deployed in a nested subfolder (e.g., /projects/ExpenseTracker/)
const originalFetch = window.fetch;
if (originalFetch) {
  try {
    Object.defineProperty(window, 'fetch', {
      value: (input: RequestInfo | URL, init?: RequestInit) => {
        if (typeof input === 'string' && input.startsWith('/api/')) {
          const pathname = window.location.pathname;
          if (pathname && pathname !== '/' && pathname !== '/index.html') {
            const cleanPath = pathname.replace(/(index\.html|\.html)$/i, '');
            const segments = cleanPath.split('/').filter(Boolean);
            if (segments.length > 0) {
              const prefix = '/' + segments.join('/');
              if (!input.startsWith(prefix)) {
                input = `${prefix}${input}`;
              }
            }
          }
        }
        return originalFetch(input, init);
      },
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    console.warn('[Fetch Interceptor] Failed to override via Object.defineProperty, trying direct assignment:', e);
    try {
      (window as any).fetch = (input: RequestInfo | URL, init?: RequestInit) => {
        if (typeof input === 'string' && input.startsWith('/api/')) {
          const pathname = window.location.pathname;
          if (pathname && pathname !== '/' && pathname !== '/index.html') {
            const cleanPath = pathname.replace(/(index\.html|\.html)$/i, '');
            const segments = cleanPath.split('/').filter(Boolean);
            if (segments.length > 0) {
              const prefix = '/' + segments.join('/');
              if (!input.startsWith(prefix)) {
                input = `${prefix}${input}`;
              }
            }
          }
        }
        return originalFetch(input, init);
      };
    } catch (err) {
      console.error('[Fetch Interceptor] Completely unable to override window.fetch in this sandbox:', err);
    }
  }
}

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[Service Worker] Registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('[Service Worker] Registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

