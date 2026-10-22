import {useCallback,useEffect,useRef,useState} from 'react';
import {recordingAudioSession} from '../audio';
import {analysisSize,detectPitch,type Reading} from './pitch';
type Status='idle'|'requesting'|'listening'|'error';
type Capture={context:AudioContext;releaseSession:()=>void;stream?:MediaStream;source?:MediaStreamAudioSourceNode;timer?:ReturnType<typeof setInterval>};
const idleReading:Reading={pitch:null,level:0,clipped:false,at:0};
export function microphoneError(error:unknown) {
 const name=error && typeof error==='object' && 'name' in error?error.name:'';
 if(name==='NotAllowedError'||name==='SecurityError')return 'Brak zgody na mikrofon. Zezwól na dostęp w ustawieniach tej strony w przeglądarce i spróbuj ponownie.';
 if(name==='NotFoundError')return 'Nie znaleziono mikrofonu. Podłącz go lub sprawdź ustawienia urządzenia.';
 if(name==='NotReadableError')return 'Mikrofon jest zajęty lub niedostępny. Zamknij inne aplikacje korzystające z niego i spróbuj ponownie.';
 return 'Nie udało się uruchomić mikrofonu. Sprawdź uprawnienia i spróbuj ponownie.';
}
export function useMicrophone(){
 const [status,setStatus]=useState<Status>('idle'),[error,setError]=useState(''),[reading,setReading]=useState<Reading>(idleReading);
 const generation=useRef(0),capture=useRef<Capture|null>(null);
 const dispose=useCallback(()=>{
  generation.current++;
  const old=capture.current;capture.current=null;
  if(old){clearInterval(old.timer);old.stream?.getTracks().forEach(t=>{t.onended=null;t.stop();});old.source?.disconnect();old.releaseSession();void old.context.close().catch(()=>{});}
 },[]);
 const stop=useCallback(()=>{dispose();setStatus('idle');setReading(idleReading);setError('');},[dispose]);
 useEffect(()=>{
  const hide=()=>{if(document.hidden)stop();};
  document.addEventListener('visibilitychange',hide);window.addEventListener('pagehide',stop);
  return()=>{document.removeEventListener('visibilitychange',hide);window.removeEventListener('pagehide',stop);dispose();};
 },[dispose,stop]);
 const start=useCallback(async()=>{
  dispose();setReading(idleReading);setError('');
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia||!window.AudioContext){setStatus('error');setError('Mikrofon wymaga aktualnej przeglądarki i bezpiecznego połączenia HTTPS. Otwórz aplikację w Safari lub Chrome.');return;}
  const gen=generation.current;setStatus('requesting');
  try{
   const context=new AudioContext();const resource:Capture={context,releaseSession:recordingAudioSession()};capture.current=resource;
   // Resume in the click gesture, before the asynchronous permission prompt (Safari).
   const resumed=context.resume();void resumed.catch(()=>{});
   const stream=await navigator.mediaDevices.getUserMedia({video:false,audio:{channelCount:1,echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
   if(gen!==generation.current){stream.getTracks().forEach(t=>t.stop());return;}
   resource.stream=stream;await resumed;
   if(gen!==generation.current)return;
   if(context.state!=='running')throw new Error('Audio context suspended');
   const source=context.createMediaStreamSource(stream),analyser=context.createAnalyser();
   resource.source=source;analyser.fftSize=analysisSize(context.sampleRate);source.connect(analyser); // Never connect microphone to speakers.
   const samples=new Float32Array(analyser.fftSize);
   let silentSince:number|null=null;
   for(const track of stream.getAudioTracks())track.onended=()=>{if(gen!==generation.current)return;dispose();setReading(idleReading);setStatus('error');setError('Mikrofon został odłączony. Podłącz go i włącz ponownie.');};
   resource.timer=setInterval(()=>{
    if(gen!==generation.current)return;
    if(context.state!=='running'){dispose();setReading(idleReading);setStatus('error');setError('System przerwał dostęp do dźwięku. Włącz mikrofon ponownie.');return;}
    analyser.getFloatTimeDomainData(samples);
    const at=performance.now(),result=detectPitch(samples,context.sampleRate);
    const muted=stream.getAudioTracks().some(track=>track.muted);
    silentSince=result.level<1e-8?(silentSince??at):null;
    setError(muted?'System wyciszył mikrofon. Wróć do aplikacji i uruchom mikrofon ponownie.':silentSince!==null&&at-silentSince>=3000?'Mikrofon nie przekazuje sygnału. Uruchom go ponownie. Jeśli problem wraca w aplikacji na iPhonie, otwórz tę stronę w Safari.':'');
    setReading({...result,pitch:muted?null:result.pitch,at});
   },80);
   setStatus('listening');
  }catch(e){if(gen!==generation.current)return;dispose();setReading(idleReading);setStatus('error');setError(microphoneError(e));}
 },[dispose]);
 return {status,error,reading,start,stop};
}
