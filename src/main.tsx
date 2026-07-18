
window.addEventListener("error", e => {
  document.body.innerHTML = '<div style="color: red; padding: 20px; z-index: 9999; position: absolute; background: white; width: 100%; height: 100%;"><h1>CRASH</h1><pre>' + (e.error ? e.error.stack : e.message) + '</pre></div>';
});
window.addEventListener("unhandledrejection", e => {
  document.body.innerHTML = '<div style="color: red; padding: 20px; z-index: 9999; position: absolute; background: white; width: 100%; height: 100%;"><h1>PROMISE CRASH</h1><pre>' + (e.reason ? e.reason.stack : e.reason) + '</pre></div>';
});
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/config';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
 