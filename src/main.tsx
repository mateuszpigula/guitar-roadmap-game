import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/barlow/latin-ext-400.css';
import '@fontsource/barlow/latin-ext-500.css';
import '@fontsource/barlow/latin-ext-600.css';
import '@fontsource/barlow/latin-ext-700.css';
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow/latin-700.css';
import App from './App';
import './styles.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

// Cache only the public app shell. Supabase requests and user data never enter this cache.
if(import.meta.env.PROD&&'serviceWorker' in navigator){
  window.addEventListener('load',()=>{void navigator.serviceWorker.register('/sw.js').catch(()=>{});});
}
