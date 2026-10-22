let context:AudioContext|undefined;
let recordings=0;
type SessionNavigator=Navigator&{audioSession?:{type:string}};
function setAudioMode(){
 // Safari defaults Web Audio to ambient, which can be silenced by the ring switch.
 // A microphone needs play-and-record; don't switch its session to playback.
 try{const session=(navigator as SessionNavigator).audioSession;if(session)session.type=recordings?'play-and-record':'playback';}catch{/* Optional API; other browsers use their normal audio routing. */}
}
export function playbackAudioSession(){setAudioMode();}
export function recordingAudioSession(){recordings++;setAudioMode();let released=false;return()=>{if(!released){released=true;recordings--;setAudioMode();}};}
export async function audioContext(){
 setAudioMode();
 if(!context||context.state==='closed')context=new AudioContext();
 // Call from the user gesture, before timers/effects. Safari also has 'interrupted'.
 if(context.state!=='running')await context.resume();
 if(context.state!=='running')throw new Error('Audio nie jest aktywne. Naciśnij ponownie przycisk odtwarzania.');
 return context;
}
export function tone(ctx:AudioContext,midi:number,at=ctx.currentTime,duration=.55,volume=.15){
 const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.value=440*2**((midi-69)/12);
 gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.008);gain.gain.exponentialRampToValueAtTime(.001,at+duration);
 osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+duration+.02);
 osc.onended=()=>{osc.disconnect();gain.disconnect();};
 return ()=>{osc.stop();osc.disconnect();gain.disconnect();};
}
export async function playNotes(notes:number[],together=false){const ctx=await audioContext();notes.forEach((n,i)=>tone(ctx,n,ctx.currentTime+.03+(together?0:i*.65),.6,together?.08:.15));}
export const noteNames=['C','C♯','D','E♭','E','F','F♯','G','G♯','A','B♭','B'];
export const noteName=(midi:number)=>noteNames[midi%12];
