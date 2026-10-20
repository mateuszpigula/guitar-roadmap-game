import type { AppState } from './types';
import { emptyProgress, freshState, parseBackup } from './state';

export const equal = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
export interface MergeResult { state: AppState; conflicts: string[] }
/** Three-way merge. Status and review dates form one indivisible unit. */
export function mergeProgress(base: AppState, local: AppState, remote: AppState, prefer: 'local'|'remote' = 'local'): MergeResult {
  const out = freshState(), conflicts: string[] = [];
  function choose<T>(b:T,l:T,r:T,path:string):T {
    if(equal(l,b))return r;
    if(equal(r,b)||equal(l,r))return l;
    conflicts.push(path);return prefer==='local'?l:r;
  }
  for(const id of new Set([...Object.keys(base.progress),...Object.keys(local.progress),...Object.keys(remote.progress)])) {
    const b=base.progress[id]??emptyProgress(),l=local.progress[id]??emptyProgress(),r=remote.progress[id]??emptyProgress();
    const unit=(p:typeof b)=>({status:p.status,reviewStep:p.reviewStep,...(p.completedAt?{completedAt:p.completedAt}:{}),...(p.due?{due:p.due}:{})});
    out.progress[id]={...choose(unit(b),unit(l),unit(r),`progress.${id}.status`),notes:choose(b.notes,l.notes,r.notes,`progress.${id}.notes`),bpm:choose(b.bpm,l.bpm,r.bpm,`progress.${id}.bpm`),unlocked:choose(b.unlocked,l.unlocked,r.unlocked,`progress.${id}.unlocked`)};
  }
  for(const id of new Set([...Object.keys(base.songs),...Object.keys(local.songs),...Object.keys(remote.songs)])) {
    const fallback={status:'todo' as const,bpm:60,notes:''};
    const b=base.songs[id]??fallback,l=local.songs[id]??fallback,r=remote.songs[id]??fallback;
    out.songs[id]={status:choose(b.status,l.status,r.status,`songs.${id}.status`),bpm:choose(b.bpm,l.bpm,r.bpm,`songs.${id}.bpm`),notes:choose(b.notes,l.notes,r.notes,`songs.${id}.notes`)};
  }
  for(const key of ['reducedMotion','sessionMinutes'] as const) {
    Object.assign(out.settings,{[key]:choose(base.settings[key],local.settings[key],remote.settings[key],`settings.${key}`)});
  }
  for(const id of new Set([...base.sessions,...local.sessions,...remote.sessions].map(s=>s.id))) {
    const b=base.sessions.find(s=>s.id===id),l=local.sessions.find(s=>s.id===id),r=remote.sessions.find(s=>s.id===id);
    // Session minutes depend on the selected blocks and duration: keep them together.
    const picked=choose(b,l,r,`sessions.${id}`);if(picked)out.sessions.push(picked);
  }
  out.sessions.sort((a,b)=>a.id.localeCompare(b.id));
  return {state:parseBackup(JSON.stringify(out)),conflicts};
}
export interface CloudCache { version:1; base:AppState; current:AppState }
export function parseCache(value:unknown):CloudCache {
  if(!value||typeof value!=='object'||!('version' in value)||value.version!==1||!('base' in value)||!('current' in value))throw new Error('Nie można odczytać lokalnej kopii konta. Nie nadpisano danych.');
  return {version:1,base:parseBackup(JSON.stringify(value.base)),current:parseBackup(JSON.stringify(value.current))};
}
export function cloudCache(userId:string, factory:IDBFactory=indexedDB) {
  async function db(){return new Promise<IDBDatabase>((resolve,reject)=>{const req=factory.open('guitar-quest-accounts',1);req.onupgradeneeded=()=>req.result.createObjectStore('accounts');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(new Error('Lokalny zapis konta jest niedostępny.'));req.onblocked=()=>reject(new Error('Zamknij inne karty, aby otworzyć zapis konta.'));});}
  return {
    async read():Promise<CloudCache>{const d=await db();try{return await new Promise((resolve,reject)=>{const tx=d.transaction('accounts','readonly'),q=tx.objectStore('accounts').get(userId);q.onsuccess=()=>{try{resolve(q.result===undefined?{version:1,base:freshState(),current:freshState()}:parseCache(q.result));}catch(e){reject(e);}};q.onerror=()=>reject(q.error);});}finally{d.close();}},
    async write(value:CloudCache){const d=await db();try{await new Promise<void>((resolve,reject)=>{const tx=d.transaction('accounts','readwrite');tx.objectStore('accounts').put(value,userId);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('Nie udało się zapisać kopii offline.'));tx.onabort=()=>reject(new Error('Zapis offline został przerwany.'));});}finally{d.close();}}
  };
}
