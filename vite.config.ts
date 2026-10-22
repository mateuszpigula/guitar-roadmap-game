import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
export default defineConfig({
  plugins: [react(),{
    name:'guitar-quest-offline',apply:'build',
    generateBundle(_,bundle){
      const publicFiles=['manifest.webmanifest','favicon.svg','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];
      const assets=['/','/index.html',...publicFiles.map(name=>'/'+name),...Object.keys(bundle).filter(name=>!name.endsWith('.map')).map(name=>'/'+name)];
      const hash=createHash('sha256').update(JSON.stringify(assets));
      for(const name of publicFiles)hash.update(readFileSync(new URL(`./public/${name}`,import.meta.url)));
      hash.update(String(bundle['index.html']?.type==='asset'?bundle['index.html'].source:''));
      const version=hash.digest('hex').slice(0,16);
      this.emitFile({type:'asset',fileName:'sw.js',source:`
const CACHE='guitar-quest-${version}';
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('guitar-quest-')&&key!==CACHE).slice(0,-1).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).catch(()=>caches.open(CACHE).then(cache=>cache.match('/index.html')).then(response=>response||Response.error())));return;
 }
 if(ASSETS.includes(url.pathname)||url.pathname.startsWith('/assets/'))event.respondWith(caches.open(CACHE).then(cache=>cache.match(request)).then(response=>response||(url.pathname.startsWith('/assets/')?caches.match(request):undefined)).then(response=>response||fetch(request)));
});`});
    }
  }],
  build:{rollupOptions:{output:{manualChunks:{supabase:['@supabase/supabase-js'],validation:['ajv']}}}}
});
