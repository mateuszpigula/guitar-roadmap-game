import {describe,expect,it} from 'vitest';
import {emptyTuner,trackTuner,TUNER_HOLD_MS} from './tuner';
import {frequencyFor,type Reading} from './pitch';
const frame=(midi:number|null,at:number,cents=0):Reading=>({at,level:.002,clipped:false,pitch:midi===null?null:{midi,cents,frequency:frequencyFor(midi)*2**(cents/1200),confidence:.95}});
describe('tuner display stability',()=>{
 it('needs two consistent frames before displaying a new note',()=>{
  const first=trackTuner(emptyTuner,frame(40,100));expect(first.pitch).toBeNull();
  const second=trackTuner(first,frame(40,180));expect(second.pitch?.midi).toBe(40);
 });
 it('holds briefly through missed frames but expires after silence',()=>{
  let track=trackTuner(trackTuner(emptyTuner,frame(40,100)),frame(40,180));
  track=trackTuner(track,frame(null,260));expect(track.pitch?.midi).toBe(40);expect(track.at).toBe(180);
  track=trackTuner(track,frame(null,180+TUNER_HOLD_MS+1));expect(track.pitch).toBeNull();
 });
 it('ignores a single octave glitch and accepts a deliberate string change',()=>{
  let track=trackTuner(trackTuner(emptyTuner,frame(40,100)),frame(40,180));
  track=trackTuner(track,frame(52,260));expect(track.pitch?.midi).toBe(40);
  track=trackTuner(track,frame(45,340));expect(track.pitch?.midi).toBe(40);
  track=trackTuner(track,frame(45,420));expect(track.pitch?.midi).toBe(45);
 });
 it('rejects isolated noise and reduces small needle jitter without losing cents',()=>{
  let track=trackTuner(emptyTuner,frame(64,100));track=trackTuner(track,frame(null,180));track=trackTuner(track,frame(64,260));expect(track.pitch).toBeNull();
  track=trackTuner(track,frame(64,340,4));track=trackTuner(track,frame(64,420,-3));expect(Math.abs(track.pitch!.cents)).toBeLessThan(1);
 });
});
