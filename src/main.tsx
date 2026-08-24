import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA capabilities & offline support
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('[Cultiva PWA] Aplicación lista para funcionar sin conexión.');
  },
  onUpdate: (registration) => {
    console.log('[Cultiva PWA] Nueva versión disponible en el Service Worker.');
  },
});

