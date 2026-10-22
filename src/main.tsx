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
import {ThemeProvider} from './theme';
import './styles.css';
import './theme.css';
import {bootstrapCatalog} from './content/repository';
const root=ReactDOM.createRoot(document.getElementById('root')!);
root.render(<div className="loading"><p>Otwieram program nauki…</p></div>);
void bootstrapCatalog().then(contentStatus=>root.render(<React.StrictMode><ThemeProvider><App contentStatus={contentStatus}/></ThemeProvider></React.StrictMode>));

// Cache only the public app shell. Supabase requests and user data never enter this cache.
if(import.meta.env.PROD&&'serviceWorker' in navigator){
  window.addEventListener('load',()=>{void navigator.serviceWorker.register('/sw.js').catch(()=>{});});
}
