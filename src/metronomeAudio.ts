import {playbackAudioSession} from './audio';
export interface MetronomeConfig {bpm:number;meter:number}
export type MetronomeState={status:'stopped'|'starting'|'playing';error?:string};
const sampleRate=22050;
// Render real audible clicks ahead of time. Native media playback, not JS timers,
// owns the rhythm while Safari suspends page execution behind the lock screen.
export function metronomeWav({bpm,meter}:MetronomeConfig){
 if(!Number.isInteger(bpm)||bpm<30||bpm>240||![2,3,4].includes(meter))throw Error('Nieprawidłowe tempo lub metrum.');
 const beatFrames=sampleRate*60/bpm;
 const bars=Math.ceil(60/(60/bpm*meter)); // At least a minute; loop only at a bar boundary.
 const beats=bars*meter,frames=Math.round(beats*beatFrames);
 const buffer=new ArrayBuffer(44+frames*2),view=new DataView(buffer);
 const text=(offset:number,value:string)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
 text(0,'RIFF');view.setUint32(4,36+frames*2,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,frames*2,true);
 const clickFrames=Math.round(sampleRate*.065);
 for(let beat=0;beat<beats;beat++){
  const start=Math.round(beat*beatFrames),accent=beat%meter===0,frequency=accent?880:660;
  for(let j=0;j<clickFrames;j++){
   const t=j/sampleRate,envelope=Math.min(1,j/(sampleRate*.002))*Math.exp(-t*75)*(1-j/clickFrames);
   const value=Math.sin(2*Math.PI*frequency*t)*envelope*(accent?.65:.42);
   view.setInt16(44+(start+j)*2,Math.round(value*32767),true);
  }
 }
 return buffer;
}
let owner:MetronomePlayer|undefined;
export class MetronomePlayer {
 private url:string|undefined;private generation=0;private wanted=false;private starting=false;private disposed=false;
 private config:MetronomeConfig={bpm:60,meter:4};
 private paused=()=>{if(this.wanted&&!this.starting&&this.audio.paused){this.wanted=false;this.setSessionState('paused');this.notify({status:'stopped',error:'Odtwarzanie wstrzymane przez system. Naciśnij Graj, aby wznowić.'});}};
 private failed=()=>{if(this.wanted)this.fail('Nie udało się odtworzyć metronomu. Naciśnij Graj, aby spróbować ponownie.');};
 constructor(private audio:HTMLAudioElement,private notify:(state:MetronomeState)=>void){
  audio.loop=true;audio.preload='auto';audio.addEventListener('pause',this.paused);audio.addEventListener('error',this.failed);
 }
 private setSessionState(state:MediaSessionPlaybackState){try{if('mediaSession' in navigator)navigator.mediaSession.playbackState=state;}catch{/* Optional browser integration. */}}
 private installSession(){
  if(!('mediaSession' in navigator))return;
  try{if(typeof MediaMetadata!=='undefined')navigator.mediaSession.metadata=new MediaMetadata({title:`Metronom · ${this.config.bpm} BPM`,artist:`Guitar Quest · ${this.config.meter}/4`});}catch{/* Optional. */}
  for(const [action,handler]of [['play',()=>void this.start(this.config)],['pause',()=>this.pause()],['stop',()=>this.stop()]] as const){try{navigator.mediaSession.setActionHandler(action,handler);}catch{/* Unsupported action. */}}
 }
 private clearSession(){if(owner!==this)return;owner=undefined;if(!('mediaSession' in navigator))return;
  for(const action of ['play','pause','stop'] as const){try{navigator.mediaSession.setActionHandler(action,null);}catch{/* Optional. */}}
  try{navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none';}catch{/* Optional. */}
 }
 async start(config:MetronomeConfig){
  if(this.disposed)return;
  if(owner&&owner!==this)owner.stop();owner=this;
  const gen=++this.generation;this.config=config;this.wanted=true;this.starting=true;this.notify({status:'starting'});
  try{
   playbackAudioSession();this.audio.pause();
   if(this.url)URL.revokeObjectURL(this.url);
   this.url=URL.createObjectURL(new Blob([metronomeWav(config)],{type:'audio/wav'}));
   this.audio.src=this.url;this.audio.loop=true;this.installSession();
   // Called synchronously from click/change: preserve iOS user activation.
   await this.audio.play();
   if(gen!==this.generation||this.disposed)return;
   this.starting=false;this.setSessionState('playing');this.notify({status:'playing'});
  }catch{if(gen===this.generation&&!this.disposed)this.fail('Nie udało się uruchomić audio. Sprawdź głośność multimediów i naciśnij Graj ponownie.');}
 }
 private fail(error:string){this.stop();this.notify({status:'stopped',error});}
 pause(){this.generation++;this.wanted=false;this.starting=false;this.audio.pause();this.setSessionState('paused');this.notify({status:'stopped'});}
 stop(){this.generation++;this.wanted=false;this.starting=false;this.audio.pause();this.audio.removeAttribute('src');this.audio.load();if(this.url){URL.revokeObjectURL(this.url);this.url=undefined;}this.clearSession();if(!this.disposed)this.notify({status:'stopped'});}
 beat(){return Math.floor(this.audio.currentTime*this.config.bpm/60)%this.config.meter;}
 dispose(){this.disposed=true;this.stop();this.audio.removeEventListener('pause',this.paused);this.audio.removeEventListener('error',this.failed);}
}
