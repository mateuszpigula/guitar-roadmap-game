import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {createHash} from 'node:crypto';
export default defineConfig({
  plugins: [react(),{
    name:'guitar-quest-offline',apply:'build',
    generateBundle(_,bundle){
      const assets=['/','/index.html',...Object.keys(bundle).filter(name=>!name.endsWith('.map')).map(name=>'/'+name)];
      const version=createHash('sha256').update(JSON.stringify(assets)).digest('hex').slice(0,16);
      this.emitFile({type:'asset',fileName:'sw.js',source:`
const CACHE='guitar-quest-${version}';
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('guitar-quest-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).catch(()=>caches.match('/index.html').then(response=>response||Response.error())));return;
 }
 if(ASSETS.includes(url.pathname))event.respondWith(caches.open(CACHE).then(async cache=>await cache.match(request)||fetch(request)));
});`});
    }
  }],
  build:{rollupOptions:{output:{manualChunks:{supabase:['@supabase/supabase-js']}}}}
});
