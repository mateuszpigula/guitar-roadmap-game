import {cloud} from '../cloud';
import {bundledContent,bundledVersion,installCatalog,curriculumVersion} from './catalog';
import {assertCompatible,parseRelease} from './model';
import type {Release} from './model';
export interface ContentCache {read():Promise<Release|null>;write(r:Release):Promise<void>}
export function contentCache(factory:IDBFactory=indexedDB):ContentCache {
 async function open(){return new Promise<IDBDatabase>((resolve,reject)=>{const q=factory.open('guitar-quest-curriculum',1);q.onupgradeneeded=()=>q.result.createObjectStore('releases');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);q.onblocked=()=>reject(new Error('Zapis programu jest zablokowany przez inną kartę.'));});}
 return {
  async read(){const db=await open();try{return await new Promise<Release|null>((resolve,reject)=>{const q=db.transaction('releases').objectStore('releases').get('current');q.onsuccess=()=>{try{resolve(q.result?parseRelease(q.result):null);}catch(e){reject(e);}};q.onerror=()=>reject(q.error);});}finally{db.close();}},
  async write(r){const db=await open();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('releases','readwrite'),store=tx.objectStore('releases'),existing=store.get('current');existing.onsuccess=()=>{let newer=false;try{newer=!!existing.result&&parseRelease(existing.result).version>r.version;}catch{/* Replace an invalid cache with a verified release. */}if(!newer)store.put(r,'current');};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
 };
}
export async function fetchRelease():Promise<Release|null>{
 if(!cloud||navigator.onLine===false)return null;
 const {data,error}=await cloud.from('curriculum_releases').select('version,title,published_at,content').order('version',{ascending:false}).limit(1).abortSignal(AbortSignal.timeout(5000)).maybeSingle();
 if(error)throw error;return data?parseRelease(data):null;
}
export interface ContentStatus {version:number;origin:'cloud'|'cache'|'bundle';warning:string}
export async function loadCatalog(cache:ContentCache,fetcher=fetchRelease):Promise<ContentStatus>{
 let saved:Release|null=null,warning='';
 try{saved=await cache.read();if(saved&&saved.version<bundledVersion)saved=null;if(saved)assertCompatible(bundledContent,saved.content);}catch{saved=null;warning='Nie można odczytać lokalnej kopii programu.';}
 let selected=saved,origin:ContentStatus['origin']=saved?'cache':'bundle';
 try{const remote=await fetcher();if(remote&&remote.version>=(saved?.version??bundledVersion)){assertCompatible(saved?.content??bundledContent,remote.content);selected=remote;origin='cloud';try{await cache.write(remote);warning='';}catch{warning='Program pobrany, ale zapis offline jest niedostępny. Przywróć dostęp do pamięci przeglądarki.';}}else if(!remote||!selected)warning=saved?'Korzystasz z ostatnio pobranego programu.':'Korzystasz z programu dołączonego do aplikacji.';}
 catch{warning=saved?'Nie udało się pobrać aktualizacji. Korzystasz z zapisanej wersji programu.':'Nie udało się pobrać programu z chmury. Dostępna jest wersja dołączona do aplikacji.';}
 installCatalog(selected??{version:bundledVersion,title:'Program dołączony do aplikacji',published_at:'2026-10-21T00:00:00.000Z',content:bundledContent});
 return {version:curriculumVersion,origin,warning};
}
export async function bootstrapCatalog():Promise<ContentStatus>{
 try{return await loadCatalog(contentCache());}catch{return loadCatalog({read:async()=>null,write:async()=>{throw new Error('Brak zapisu');}});}
}
