// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {metronomeWav,MetronomePlayer} from './metronomeAudio';
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
it.each([[30,4],[91,3],[240,2]])('renders exact %i BPM in %i/4, with audible accents and no partial bar at the seam',(bpm,meter)=>{
 const wav=metronomeWav({bpm,meter}),v=new DataView(wav),rate=v.getUint32(24,true),frames=(wav.byteLength-44)/2;
 expect(String.fromCharCode(...new Uint8Array(wav,0,4))).toBe('RIFF');expect(frames/rate).toBeGreaterThanOrEqual(59.999);
 const beatFrames=rate*60/bpm,beats=Math.round(frames/beatFrames);expect(beats%meter).toBe(0);expect(Math.abs(frames-beats*beatFrames)).toBeLessThanOrEqual(.5);
 const peak=(beat:number)=>{let p=0;for(let j=0;j<rate*.06;j++)p=Math.max(p,Math.abs(v.getInt16(44+(Math.round(beat*beatFrames)+j)*2,true)));return p;};
 expect(peak(0)).toBeGreaterThan(peak(1)*1.3);expect(peak(meter)).toBe(peak(0));
 for(let beat=0;beat<beats;beat++){
  expect(peak(beat)).toBeGreaterThan(5000);
  expect(v.getInt16(44+Math.round((beat+.5)*beatFrames)*2,true)).toBe(0);
 }
 expect(v.getInt16(wav.byteLength-2,true)).toBe(0);
});
it('rejects invalid input before rendering',()=>{expect(()=>metronomeWav({bpm:0,meter:4})).toThrow();expect(()=>metronomeWav({bpm:60,meter:7})).toThrow();});
it('provides lock-screen controls and removes them on stop',async()=>{
 const actions=new Map<string,(()=>void)|null>(),session={playbackState:'none',metadata:null,setActionHandler:vi.fn((name,fn)=>actions.set(name,fn))};
 vi.stubGlobal('navigator',{mediaSession:session});vi.stubGlobal('MediaMetadata',class{constructor(public data:unknown){}});
 vi.spyOn(URL,'createObjectURL').mockReturnValue('blob:track');vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{});
 const audio=document.createElement('audio');audio.play=vi.fn().mockResolvedValue(undefined);audio.pause=vi.fn();audio.load=vi.fn();
 const notify=vi.fn(),player=new MetronomePlayer(audio,notify);await player.start({bpm:80,meter:3});expect(session.playbackState).toBe('playing');
 actions.get('pause')!();expect(session.playbackState).toBe('paused');expect(notify).toHaveBeenLastCalledWith({status:'stopped'});
 actions.get('play')!();await Promise.resolve();expect(audio.play).toHaveBeenCalledTimes(2);
 actions.get('stop')!();expect(session.playbackState).toBe('none');expect(actions.get('play')).toBeNull();player.dispose();
});
