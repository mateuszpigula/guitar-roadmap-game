// Monophonic YIN-style normalized difference detector. No audio leaves the device.
export type Pitch = {frequency:number; midi:number; cents:number; confidence:number};
export type Reading = {pitch:Pitch|null; level:number; clipped:boolean; at:number};
export const frequencyFor = (midi:number) => 440 * 2 ** ((midi-69)/12);
export const pitchLabel = (midi:number) => `${['C','C♯','D','E♭','E','F','F♯','G','G♯','A','B♭','B'][((midi%12)+12)%12]}${Math.floor(midi/12)-1}`;

// Quiet nylon strings can arrive below -50 dBFS even close to a phone.
// Periodicity, rather than loudness alone, distinguishes a note from background noise.
export const MIN_SIGNAL_RMS=.0005;
export const analysisSize=(sampleRate:number)=>Math.min(32768,Math.max(4096,2**Math.ceil(Math.log2(sampleRate*.12))));
export function detectPitch(samples:Float32Array, sampleRate:number):Omit<Reading,'at'> {
 let energy=0,mean=0,clippedSamples=0;
 if(samples.length<32||!Number.isFinite(sampleRate)||sampleRate<=0)return {pitch:null,level:0,clipped:false};
 for(const x of samples){mean+=x;if(Math.abs(x)>=.98)clippedSamples++;}mean/=samples.length;
 for(const x of samples)energy+=(x-mean)**2;
 const level=Math.sqrt(energy/samples.length),clipped=clippedSamples/samples.length>.005;
 const empty={pitch:null,level,clipped};
 if(!Number.isFinite(level)||level<MIN_SIGNAL_RMS||clipped)return empty;
 // Decimate to <= 12 kHz for bounded CPU cost on phones, retaining the guitar range.
 const step=Math.max(1,Math.floor(sampleRate/12000)),rate=sampleRate/step;
 const data=new Float32Array(Math.floor(samples.length/step));
 for(let i=0;i<data.length;i++){let sum=0;for(let j=0;j<step;j++)sum+=samples[i*step+j]-mean;data[i]=sum/step;}
 const maxLag=Math.min(Math.ceil(rate/70),Math.floor(data.length/2)-1),minLag=Math.floor(rate/1050);
 const length=data.length-maxLag,normalized=new Float32Array(maxLag+1);normalized[0]=1;
 let cumulative=0;
 for(let lag=1;lag<=maxLag;lag++){
  let difference=0;for(let i=0;i<length;i++)difference+=(data[i]-data[i+lag])**2;
  cumulative+=difference;normalized[lag]=cumulative>0?difference*lag/cumulative:1;
 }
 // Find the best valley first. Raising a simple first-hit threshold mistakes
 // the stronger second harmonic for the fundamental on a plucked nylon string.
 let best=1;
 for(let lag=Math.max(2,minLag);lag<maxLag;lag++)best=Math.min(best,normalized[lag]);
 if(best>.22)return empty;
 const limit=Math.min(.22,best*1.25+.025);
 for(let lag=Math.max(2,minLag);lag<maxLag;lag++){
  if(normalized[lag]>limit||normalized[lag]>normalized[lag-1]||normalized[lag]>normalized[lag+1])continue;
  const confidence=1-normalized[lag];
  const left=normalized[lag-1],middle=normalized[lag],right=normalized[lag+1];
  const denominator=left-2*middle+right;
  const refined=lag+(denominator?(left-right)/(2*denominator):0);
  const frequency=rate/refined;if(frequency<73||frequency>1000)return empty;
  const fractional=69+12*Math.log2(frequency/440),midi=Math.round(fractional);
  return {pitch:{frequency,midi,cents:100*(fractional-midi),confidence},level,clipped};
 }
 return empty;
}

// Require consecutive reliable frames. A wrong note, silence or a long gap resets the hold.
export function advanceHold(since:number|null, reading:Reading, target:number) {
 if(!reading.pitch||reading.pitch.midi!==target||Math.abs(reading.pitch.cents)>35)return {since:null,progress:0};
 const start=since??reading.at;
 return {since:start,progress:Math.min(1,(reading.at-start)/650)};
}
