import {frequencyFor,type Pitch,type Reading} from './pitch';

// Display smoothing only: the note exercise still receives raw, current readings.
export interface TunerTrack {pitch:Pitch|null;at:number;candidateAt:number;frequencies:number[]}
export const emptyTuner: TunerTrack={pitch:null,at:0,candidateAt:0,frequencies:[]};
export const TUNER_HOLD_MS=1200;
export function trackTuner(previous:TunerTrack,reading:Reading):TunerTrack {
 const current=reading.at-previous.at<=TUNER_HOLD_MS?previous:{...emptyTuner};
 if(!reading.pitch||reading.clipped)return {...current,frequencies:[],candidateAt:0};
 const f=reading.pitch.frequency,last=previous.frequencies.at(-1);
 const follows=last!==undefined&&reading.at-previous.candidateAt<=250&&Math.abs(1200*Math.log2(f/last))<50;
 const frequencies=follows?[...previous.frequencies.slice(-2),f]:[f];
 if(frequencies.length<2)return {...current,frequencies,candidateAt:reading.at};
 const sorted=[...frequencies].sort((a,b)=>a-b);
 const frequency=sorted.length===2?(sorted[0]+sorted[1])/2:sorted[1];
 const midi=Math.round(69+12*Math.log2(frequency/440));
 return {pitch:{...reading.pitch,frequency,midi,cents:1200*Math.log2(frequency/frequencyFor(midi))},at:reading.at,candidateAt:reading.at,frequencies};
}
