import {useEffect,useRef,useState} from 'react';
import {Pause,Play,Volume2} from 'lucide-react';
import {BpmInput} from './BpmInput';
import {audioContext,tone} from '../audio';
import {MetronomePlayer,type MetronomeState} from '../metronomeAudio';

export function Metronome({compact=false,initialBpm=60}:{compact?:boolean;initialBpm?:number}){
 const [bpm,setBpm]=useState(initialBpm),[meter,setMeter]=useState(4);
 const [state,setState]=useState<MetronomeState>({status:'stopped'}),[beat,setBeat]=useState(-1),[error,setError]=useState('');
 const element=useRef<HTMLAudioElement>(null),player=useRef<MetronomePlayer|null>(null);
 const running=state.status==='playing',starting=state.status==='starting';
 useEffect(()=>{
  const engine=new MetronomePlayer(element.current!,next=>{setState(next);setError(next.error??'');});player.current=engine;
  return()=>{engine.dispose();player.current=null;};
 },[]);
 function toggle(){if(running||starting)player.current?.stop();else void player.current?.start({bpm,meter});}
 function changeTempo(value:number){setBpm(value);if(running||starting)void player.current?.start({bpm:value,meter});}
 function changeMeter(value:number){setMeter(value);if(running||starting)void player.current?.start({bpm,meter:value});}
 useEffect(()=>{
  if(!running){setBeat(-1);return;}
  // This timer paints only. Audio continues independently when timers are throttled.
  const display=()=>{if(!document.hidden)setBeat(player.current?.beat()??-1);};
  display();const timer=setInterval(display,50);document.addEventListener('visibilitychange',display);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',display);};
 },[running]);
 async function testSound(){setError('');try{const audio=await audioContext();tone(audio,81,audio.currentTime+.02,.2,.3);}catch{setError('Audio jest niedostępne. Sprawdź głośność multimediów, wyjście Bluetooth i uprawnienia przeglądarki.');}}
 const controls=<><div className="beats" aria-label={`Puls metronomu ${meter}/4`}>{Array.from({length:meter},(_,i)=><span key={i} className={running&&beat===i?'on':''}>{i+1}</span>)}</div><div className="row"><label>Akcent <select aria-label="Metrum metronomu" value={meter} onChange={e=>changeMeter(+e.target.value)}><option value={4}>4/4</option><option value={3}>3/4</option><option value={2}>2/4</option></select></label><button className="primary" aria-label={running?'Zatrzymaj metronom':starting?'Anuluj uruchamianie metronomu':'Uruchom metronom'} onClick={()=>void toggle()}>{running?<Pause size={16}/>:<Play size={16}/>} {running?'Zatrzymaj':starting?'Anuluj':'Graj'}</button></div></>;
 return <section className={compact?'metronome-compact':'panel tool-panel'} aria-label="Metronom">
  {!compact&&<><div className="section-label">01 / RYTM</div><h2>Twój równy puls</h2><p>Najpierw czysto. Potem szybciej.</p></>}
  {compact?<label className="compact-tempo">Metronom <BpmInput ariaLabel="Tempo metronomu w BPM" value={bpm} onChange={changeTempo}/> BPM</label>:<><div className="tempo"><button aria-label="Zmniejsz tempo" onClick={()=>changeTempo(Math.max(30,bpm-5))}>−</button><strong>{bpm}<small>BPM</small></strong><button aria-label="Zwiększ tempo" onClick={()=>changeTempo(Math.min(240,bpm+5))}>+</button></div><label className="range-label">Tempo<input aria-label="Tempo metronomu" type="range" min="30" max="240" value={bpm} onChange={e=>changeTempo(+e.target.value)}/></label></>}
  <audio ref={element} hidden loop preload="auto"/>
  {controls}
  {running&&<p className="small metronome-background" role="status">Gra także w tle. Zatrzymaj tutaj lub z ekranu blokady. Wyjście z lekcji / Warsztatu zatrzymuje metronom.</p>}
  <div className="metronome-help"><button className="text-button" onClick={()=>void testSound()}><Volume2 size={14}/> Sprawdź dźwięk</button>{!compact&&<span className="small">Nie słyszysz? Sprawdź głośność multimediów i połączenie Bluetooth. W starszym Safari wyłącz tryb cichy telefonu.</span>}</div>
  {error&&<p className="metronome-error" role="alert">{error}</p>}
 </section>;
}
