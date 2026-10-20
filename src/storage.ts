import type { AppState } from './types';
import { freshState, parseBackup } from './state';
export interface ProgressRepository { load():Promise<AppState>; save(state:AppState):Promise<void>; }
export function createRepository(factory:IDBFactory=indexedDB):ProgressRepository {
 let database:Promise<IDBDatabase>|undefined;
 function open(){return database??=new Promise<IDBDatabase>((resolve,reject)=>{
  const request=factory.open('guitar-quest',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('state');
  request.onsuccess=()=>{request.result.onversionchange=()=>request.result.close();resolve(request.result);};
  request.onerror=()=>{database=undefined;reject(new Error('Przeglądarka nie udostępnia lokalnego zapisu.'));};
  request.onblocked=()=>{database=undefined;reject(new Error('Zamknij inne karty Guitar Quest i spróbuj ponownie.'));};
 });}
 return {
  async load(){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('state','readonly');const req=tx.objectStore('state').get('progress');req.onsuccess=()=>{try{resolve(req.result===undefined?freshState():parseBackup(JSON.stringify(req.result)));}catch(e){reject(e);}};req.onerror=()=>reject(req.error);});},
  async save(state){const db=await open();return new Promise<void>((resolve,reject)=>{const tx=db.transaction('state','readwrite');tx.objectStore('state').put(state,'progress');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('Nie udało się zapisać postępu. Wyeksportuj kopię i sprawdź miejsce w przeglądarce.'));tx.onabort=()=>reject(new Error('Zapis został przerwany.'));});}
 };
}
