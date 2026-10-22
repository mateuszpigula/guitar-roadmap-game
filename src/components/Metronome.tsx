import {useEffect,useRef,useState} from 'react';
import {Pause,Play,Volume2} from 'lucide-react';
import {BpmInput} from './BpmInput';
import {audioContext,tone} from '../audio';

export function Metronome({compact=false,initialBpm=60}:{compact?:boolean;initialBpm?:number}){
 const [bpm,setBpm]=useState(initialBpm),[meter,setMeter]=useState(4),[ctx,setCtx]=useState<AudioContext|null>(null);
 const [starting,setStarting]=useState(false),[beat,setBeat]=useState(-1),[error,setError]=useState('');
 const generation=useRef(0),pending=useRef(false);
 const running=ctx!==null;
 function stop(){generation.current++;pending.current=false;setStarting(false);setCtx(null);setBeat(-1);}
 async function toggle(){
  if(running||pending.current){stop();return;}
  const gen=++generation.current;pending.current=true;setStarting(true);setError('');
  // This is inside the click handler: create/resume audio while user activation is live.
  const ready=audioContext();
  try{const audio=await ready;if(gen===generation.current)setCtx(audio);}
  catch{if(gen===generation.current)setError('Nie udało się uruchomić audio. Sprawdź głośność multimediów i naciśnij Graj ponownie.');}
  finally{if(gen===generation.current){pending.current=false;setStarting(false);}}
 }
 useEffect(()=>{
  const hide=()=>{if(document.hidden)stop();};
  document.addEventListener('visibilitychange',hide);
  return()=>{generation.current++;document.removeEventListener('visibilitychange',hide);};
 },[]);
 useEffect(()=>{
  if(!ctx)return;
  let next=ctx.currentTime+.07,index=0;
  const displays=new Set<ReturnType<typeof setTimeout>>(),sounds=new Map<number,()=>void>();
  function schedule(){
   if(!ctx||ctx.state!=='running'){setCtx(null);setBeat(-1);setError('Dźwięk został przerwany. Naciśnij Graj, aby wznowić metronom.');return;}
   for(const [end] of sounds)if(end<ctx.currentTime)sounds.delete(end);
   if(next<ctx.currentTime-.1)next=ctx.currentTime+.03;
   while(next<ctx.currentTime+.1){
    const b=index%meter;
    sounds.set(next+.1,tone(ctx,b===0?81:76,next,.065,b===0?.35:.25));
    const display=setTimeout(()=>{displays.delete(display);setBeat(b);},Math.max(0,(next-ctx.currentTime)*1000));displays.add(display);
    next+=60/bpm;index++;
   }
  }
  schedule();const interval=setInterval(schedule,25);
  return()=>{clearInterval(interval);displays.forEach(clearTimeout);sounds.forEach(cancel=>cancel());};
 },[ctx,bpm,meter]);
 async function testSound(){setError('');try{const audio=await audioContext();tone(audio,81,audio.currentTime+.02,.2,.3);}catch{setError('Audio jest niedostępne. Sprawdź głośność multimediów, wyjście Bluetooth i uprawnienia przeglądarki.');}}
 const controls=<><div className="beats" aria-label={`Puls metronomu ${meter}/4`}>{Array.from({length:meter},(_,i)=><span key={i} className={running&&beat===i?'on':''}>{i+1}</span>)}</div><div className="row"><label>Akcent <select aria-label="Metrum metronomu" value={meter} onChange={e=>setMeter(+e.target.value)}><option value={4}>4/4</option><option value={3}>3/4</option><option value={2}>2/4</option></select></label><button className="primary" aria-label={running?'Zatrzymaj metronom':starting?'Anuluj uruchamianie metronomu':'Uruchom metronom'} onClick={()=>void toggle()}>{running?<Pause size={16}/>:<Play size={16}/>} {running?'Zatrzymaj':starting?'Anuluj':'Graj'}</button></div></>;
 return <section className={compact?'metronome-compact':'panel tool-panel'} aria-label="Metronom">
  {!compact&&<><div className="section-label">01 / RYTM</div><h2>Twój równy puls</h2><p>Najpierw czysto. Potem szybciej.</p></>}
  {compact?<label className="compact-tempo">Metronom <BpmInput ariaLabel="Tempo metronomu w BPM" value={bpm} onChange={setBpm}/> BPM</label>:<><div className="tempo"><button aria-label="Zmniejsz tempo" onClick={()=>setBpm(v=>Math.max(30,v-5))}>−</button><strong>{bpm}<small>BPM</small></strong><button aria-label="Zwiększ tempo" onClick={()=>setBpm(v=>Math.min(240,v+5))}>+</button></div><label className="range-label">Tempo<input aria-label="Tempo metronomu" type="range" min="30" max="240" value={bpm} onChange={e=>setBpm(+e.target.value)}/></label></>}
  {controls}
  <div className="metronome-help"><button className="text-button" onClick={()=>void testSound()}><Volume2 size={14}/> Sprawdź dźwięk</button>{!compact&&<span className="small">Nie słyszysz? Sprawdź głośność multimediów i połączenie Bluetooth. W starszym Safari wyłącz tryb cichy telefonu.</span>}</div>
  {error&&<p className="metronome-error" role="alert">{error}</p>}
 </section>;
}
