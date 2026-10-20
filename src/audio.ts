let context:AudioContext|undefined;
export async function audioContext(){context??=new AudioContext();if(context.state==='suspended')await context.resume();return context;}
export function tone(ctx:AudioContext,midi:number,at=ctx.currentTime,duration=.55,volume=.15){
 const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.value=440*2**((midi-69)/12);
 gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.008);gain.gain.exponentialRampToValueAtTime(.001,at+duration);
 osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+duration+.02);
}
export async function playNotes(notes:number[],together=false){const ctx=await audioContext();notes.forEach((n,i)=>tone(ctx,n,ctx.currentTime+.03+(together?0:i*.65),.6,together?.08:.15));}
export const noteNames=['C','C♯','D','E♭','E','F','F♯','G','G♯','A','B♭','B'];
export const noteName=(midi:number)=>noteNames[midi%12];
