import type { AppState } from './types';
import { freshState, parseBackup } from './state';
import { cloudCache, equal, mergeProgress } from './sync';
import type { CloudCache } from './sync';
export interface RemoteProgress { state:AppState; revision:number }
export interface CloudTransport { read():Promise<RemoteProgress>; save(revision:number,state:AppState):Promise<boolean> }
export type SyncStatus = 'loading'|'synced'|'pending'|'syncing'|'offline'|'conflict'|'error';
export interface SyncView { state:AppState|null; status:SyncStatus; error:string; conflicts:string[] }
export class CloudEngine {
  private cache: ReturnType<typeof cloudCache>;
  private queue:Promise<unknown>=Promise.resolve();
  private listeners=new Set<(v:SyncView)=>void>();
  private choice?: {base:AppState;local:AppState;remote:AppState};
  private unsaved?:CloudCache;
  view:SyncView={state:null,status:'loading',error:'',conflicts:[]};
  constructor(readonly userId:string,private transport:CloudTransport,cache=cloudCache(userId)){this.cache=cache;}
  subscribe(fn:(v:SyncView)=>void){this.listeners.add(fn);fn(this.view);return()=>{this.listeners.delete(fn);};}
  private emit(v:Partial<SyncView>){this.view={...this.view,...v};this.listeners.forEach(fn=>fn(this.view));}
  private run(job:()=>Promise<void>) {
    const task=async()=>{try{if(typeof navigator!=='undefined'&&navigator.locks)await navigator.locks.request(`guitar-quest-${this.userId}`,job);else await job();}catch(e){this.emit({status:'error',error:e instanceof Error?e.message:'Synchronizacja nie powiodła się. Spróbuj ponownie.'});}};
    this.queue=this.queue.then(task,task);return this.queue;
  }
  load(){return this.run(async()=>{const c=await this.cache.read();this.emit({state:c.current,status:'pending'});});}
  private async write(c:CloudCache){this.unsaved=c;await this.cache.write(c);this.unsaved=undefined;}
  change(fn:(s:AppState)=>AppState,expected?:AppState){
    return this.run(async()=>{
      if(this.choice){
        if(!expected)throw new Error('Najpierw wybierz wersję zmian poniżej.');
        const desired=parseBackup(JSON.stringify(fn(expected)));
        this.choice.local=mergeProgress(expected,desired,this.choice.local).state;
        await this.write({version:1,base:this.choice.base,current:this.choice.local});
        this.emit({state:this.choice.local,status:'conflict'});return;
      }
      const c=this.unsaved??await this.cache.read();
      const desired=parseBackup(JSON.stringify(fn(expected??c.current)));
      const merged=expected?mergeProgress(expected,desired,c.current):{state:desired,conflicts:[]};
      if(merged.conflicts.length&&expected){
        await this.write({version:1,base:expected,current:desired});
        this.choice={base:expected,local:desired,remote:c.current};
        this.emit({state:desired,status:'conflict',conflicts:merged.conflicts,error:''});return;
      }
      this.emit({state:merged.state,status:'pending',error:''});await this.write({...c,current:merged.state});
    });
  }
  sync(){return this.run(async()=>{
    if(this.choice)return;
    if(this.unsaved)await this.write(this.unsaved);
    if(typeof navigator!=='undefined'&&navigator.onLine===false){this.emit({status:'offline',error:''});return;}
    this.emit({status:'syncing',error:''});
    for(let attempt=0;attempt<5;attempt++) {
      const c=await this.cache.read();
      let remote:RemoteProgress;
      try{remote=await this.transport.read();}catch{this.emit({status:'offline',error:'Nie można połączyć się z chmurą. Postęp zapisany na urządzeniu; ponowimy synchronizację.'});return;}
      const merged=mergeProgress(c.base,c.current,remote.state);
      if(merged.conflicts.length){this.choice={base:c.base,local:c.current,remote:remote.state};this.emit({state:c.current,status:'conflict',conflicts:merged.conflicts,error:''});return;}
      if(!equal(merged.state,remote.state)){
        let saved:boolean;
        try{saved=await this.transport.save(remote.revision,merged.state);}catch{this.emit({status:'offline',error:'Nie udało się wysłać zmian. Kopia na tym urządzeniu czeka na synchronizację.'});return;}
        if(!saved)continue;
      }
      await this.write({version:1,base:merged.state,current:merged.state});
      this.emit({state:merged.state,status:'synced',error:'',conflicts:[]});return;
    }
    this.emit({status:'pending',error:'Drugie urządzenie właśnie zapisuje zmiany. Ponowimy próbę.'});
  });}
  resolve(prefer:'local'|'remote'){return this.run(async()=>{if(!this.choice)return;const {base,local,remote}=this.choice;const state=mergeProgress(base,local,remote,prefer).state;await this.write({version:1,base:remote,current:state});this.choice=undefined;this.emit({state,status:'pending',conflicts:[],error:''});});}
  getConflict(){return this.choice;}
  hasUnsaved(){return this.unsaved!==undefined;}
  hasPending(){return ['pending','syncing','offline','conflict','error'].includes(this.view.status);}
  async flush(){await this.queue;}
}
export const emptyRemote=():RemoteProgress=>({state:freshState(),revision:0});
