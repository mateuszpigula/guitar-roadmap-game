import {describe,it,expect} from 'vitest';
import {advanceHold,detectPitch,frequencyFor,pitchLabel,type Reading} from './pitch';
function signal(frequency:number,rate=48000,harmonic=false,cents=0){return Float32Array.from({length:4096},(_,i)=>{const phase=2*Math.PI*frequency*2**(cents/1200)*i/rate;return harmonic?.06*Math.sin(phase)+.18*Math.sin(phase*2)+.08*Math.sin(phase*3):.2*Math.sin(phase);});}
describe('single-note pitch detection',()=>{
 for(const rate of [44100,48000,96000])for(const midi of [40,45,50,55,59,60,62,64,65,67,76]){
  it(`detects MIDI ${midi} at ${rate} Hz`,()=>{const result=detectPitch(signal(frequencyFor(midi),rate),rate);expect(result.pitch?.midi).toBe(midi);expect(Math.abs(result.pitch!.cents)).toBeLessThan(5);});
 }
 it('detects fundamental despite a stronger second harmonic',()=>{for(const midi of [40,45,59,64])expect(detectPitch(signal(frequencyFor(midi),48000,true),48000).pitch?.midi).toBe(midi);});
 it('reports sharp and flat cents',()=>{for(const cents of [-25,25])expect(Math.abs(detectPitch(signal(440,48000,false,cents),48000).pitch!.cents-cents)).toBeLessThan(2);});
 it('rejects silence, DC, noise and clipping',()=>{
  let seed=123;const noise=Float32Array.from({length:4096},()=>{seed=(seed*16807)%2147483647;return .1*(seed/2147483647-.5);});
  for(const samples of [new Float32Array(4096),new Float32Array(4096).fill(.2),noise,signal(440).map(x=>x*6)])expect(detectPitch(samples,48000).pitch).toBeNull();
 });
 it('labels guitar octaves with international B notation',()=>{expect(pitchLabel(40)).toBe('E2');expect(pitchLabel(59)).toBe('B3');expect(pitchLabel(60)).toBe('C4');});
 it('needs sustained correct octave, resets on wrong/quiet/detuned frames',()=>{
  const reading:Reading={...detectPitch(signal(frequencyFor(60)),48000),at:100};
  const first=advanceHold(null,reading,60);expect(first.progress).toBe(0);
  expect(advanceHold(first.since,{...reading,at:800},60).progress).toBe(1);
  expect(advanceHold(first.since,reading,72).since).toBeNull();
  expect(advanceHold(first.since,{...reading,pitch:null},60).since).toBeNull();
  expect(advanceHold(first.since,{...reading,pitch:{...reading.pitch!,cents:40}},60).since).toBeNull();
 });
});

// A pluck decays and contains overtones plus microphone hiss; a constant loud sine
// cannot expose the dropout reported on a phone microphone.
function pluck(midi:number,rate:number,amplitude:number,age:number,noise=.0002){
 let seed=92;return Float32Array.from({length:2**Math.ceil(Math.log2(rate*.12))},(_,i)=>{
  seed=seed*16807%2147483647;const t=age+i/rate,phase=2*Math.PI*frequencyFor(midi)*t;
  return amplitude*Math.exp(-1.5*t)*(.5*Math.sin(phase)+.8*Math.sin(2*phase)+.25*Math.sin(3*phase)) + noise*(seed/2147483647*2-1);
 });
}
describe('phone microphone plucks',()=>{
 for(const rate of [44100,48000,96000])for(const midi of [40,45,50,55,59,64]){
  it(`keeps quiet/decaying string ${midi} at ${rate} Hz`,()=>{
   for(const [amplitude,age] of [[.002,.08],[.01,.5],[.01,1.2]]){
    const r=detectPitch(pluck(midi,rate,amplitude,age),rate);
    expect(r.pitch?.midi).toBe(midi);expect(Math.abs(r.pitch!.cents)).toBeLessThan(8);
   }
  });
 }
 it('does not discard an entire note for a brief pluck transient',()=>{
  const samples=pluck(45,48000,.03,.1);samples[20]=.99;
  const r=detectPitch(samples,48000);expect(r.clipped).toBe(false);expect(r.pitch?.midi).toBe(45);
 });
 it('rejects quiet hiss rather than displaying random notes',()=>{
  for(let seed=1;seed<20;seed++){
   let state=seed;const noise=Float32Array.from({length:8192},()=>{state=state*16807%2147483647;return .003*(state/2147483647*2-1);});
   expect(detectPitch(noise,48000).pitch).toBeNull();
  }
 });
});
it('keeps the fundamental with substantial hiss without accepting hiss alone',()=>{
 for(const midi of [40,45,50,55,59,64]){
  let seed=92;const samples=Float32Array.from({length:8192},(_,i)=>{seed=seed*16807%2147483647;const p=2*Math.PI*frequencyFor(midi)*i/48000;return .04*Math.sin(p)+.06*Math.sin(2*p)+.02*Math.sin(3*p)+.09*(seed/2147483647*2-1);});
  expect(detectPitch(samples,48000).pitch?.midi).toBe(midi);
 }
});
