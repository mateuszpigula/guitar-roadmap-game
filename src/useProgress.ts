import {useCallback,useEffect,useRef,useState} from 'react';
import type {User} from '@supabase/supabase-js';
import type {AppState} from './types';
import {cloud} from './cloud';
import {CloudEngine,emptyRemote} from './cloud-engine';
import type {SyncView} from './cloud-engine';
import {createRepository} from './storage';
import {freshState,parseBackup} from './state';

export function useProgress(){
  const [user,setUser]=useState<User|null>(null),[authReady,setAuthReady]=useState(!cloud),[recovery,setRecovery]=useState(false);
  const [view,setView]=useState<SyncView>({state:null,status:'loading',error:'',conflicts:[]});
  const [generation,setGeneration]=useState(0);
  const engine=useRef<CloudEngine|null>(null),guest=useRef<ReturnType<typeof createRepository>|null>(null),current=useRef<AppState|null>(null),guestBlocked=useRef(false),pending=useRef(Promise.resolve());
  const viewRef=useRef(view);viewRef.current=view;
  useEffect(()=>{
    if(!cloud)return;
    let live=true;
    const {data:{subscription}}=cloud.auth.onAuthStateChange((event,session)=>{if(!live)return;setUser(session?.user??null);setAuthReady(true);if(event==='PASSWORD_RECOVERY')setRecovery(true);});
    cloud.auth.getSession().then(({data,error})=>{if(live){if(error)setView(v=>({...v,error:'Nie można odczytać sesji konta. Zaloguj się ponownie.'}));setUser(data.session?.user??null);setAuthReady(true);}}).catch(()=>{if(live)setAuthReady(true);});
    return()=>{live=false;subscription.unsubscribe();};
  },[]);
  useEffect(()=>{
    if(!authReady)return;
    let live=true;
    setView({state:null,status:'loading',error:'',conflicts:[]});current.current=null;
    const publish=(v:SyncView)=>{if(live){current.current=v.state;setView(v);}};
    if(user&&cloud){
      const client=cloud,id=user.id;
      const controller=new CloudEngine(id,{
        async read(){const {data,error}=await client.from('guitar_progress').select('state,revision').eq('user_id',id).abortSignal(AbortSignal.timeout(12000)).maybeSingle();if(error)throw error;return data?{state:parseBackup(JSON.stringify(data.state)),revision:data.revision}:emptyRemote();},
        async save(revision,state){const {data,error}=await client.rpc('save_guitar_progress',{expected_revision:revision,next_state:state}).abortSignal(AbortSignal.timeout(12000));if(error)throw error;return data===true;}
      });
      engine.current=controller;guest.current=null;
      const off=controller.subscribe(publish);
      void controller.load().then(()=>{if(live&&controller.view.state)void controller.sync();});
      const sync=()=>{if(live&&controller.view.state&&document.visibilityState==='visible')void controller.sync();};
      const timer=window.setInterval(sync,12000);window.addEventListener('online',sync);window.addEventListener('focus',sync);document.addEventListener('visibilitychange',sync);
      return()=>{live=false;off();clearInterval(timer);window.removeEventListener('online',sync);window.removeEventListener('focus',sync);document.removeEventListener('visibilitychange',sync);if(engine.current===controller)engine.current=null;};
    }
    engine.current=null;guestBlocked.current=false;
    try{const repo=createRepository();guest.current=repo;void repo.load().then(state=>publish({state,status:'synced',error:'',conflicts:[]})).catch(()=>{guestBlocked.current=true;publish({state:freshState(),status:'error',error:'Nie można odczytać lokalnego zapisu. Wyeksportuj postęp przed zamknięciem karty.',conflicts:[]});});}
    catch{guestBlocked.current=true;publish({state:freshState(),status:'error',error:'Ta przeglądarka nie udostępnia lokalnego zapisu.',conflicts:[]});}
    return()=>{live=false;};
  },[authReady,user?.id,generation]);
  useEffect(()=>{if(!user||view.status!=='pending')return;const timer=window.setTimeout(()=>void engine.current?.sync(),700);return()=>clearTimeout(timer);},[user?.id,view]);
  useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(viewRef.current.status==='error'||viewRef.current.status==='pending'){e.preventDefault();}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[]);
  const update=useCallback((fn:(s:AppState)=>AppState)=>{
    if(engine.current){void engine.current.change(fn);return;}
    if(!current.current)return;
    const state=fn(current.current);current.current=state;
    setView(v=>({...v,state,status:guestBlocked.current?'error':'pending'}));
    if(guestBlocked.current)return;
    const repo=guest.current;
    pending.current=pending.current.catch(()=>{}).then(()=>repo!.save(state)).then(()=>{if(!engine.current&&current.current===state)setView(v=>({...v,status:'synced',error:''}));}).catch(()=>{if(!engine.current)setView(v=>({...v,status:'error',error:'Nie udało się zapisać postępu. Wyeksportuj kopię lub ponów zapis.'}));});
  },[]);
  const retry=()=>{if(engine.current){if(!engine.current.view.state)setGeneration(v=>v+1);else void engine.current.sync();}else if(guestBlocked.current)setGeneration(v=>v+1);else update(s=>s);};
  return {user,authReady,recovery,setRecovery,view,update,retry,engine:engine.current,flush:()=>engine.current?.flush()??pending.current};
}
export type ProgressController=ReturnType<typeof useProgress>;
