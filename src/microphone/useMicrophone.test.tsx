// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,renderHook} from '@testing-library/react';
import {useMicrophone} from './useMicrophone';
let getUserMedia:ReturnType<typeof vi.fn>;
let contexts:FakeContext[];
class FakeContext{
 state='running';sampleRate=48000;resume=vi.fn(async()=>{});close=vi.fn(async()=>{this.state='closed';});
 source={connect:vi.fn(),disconnect:vi.fn()};
 createMediaStreamSource=vi.fn(()=>this.source);
 createAnalyser=vi.fn(()=>({fftSize:4096,getFloatTimeDomainData:(data:Float32Array)=>data.fill(0)}));
 constructor(){contexts.push(this);}
}
function stream(){const track={stop:vi.fn(),onended:null as null|(()=>void)};return {track,getTracks:()=>[track],getAudioTracks:()=>[track]};}
beforeEach(()=>{contexts=[];getUserMedia=vi.fn();vi.stubGlobal('AudioContext',FakeContext);vi.stubGlobal('isSecureContext',true);Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia}});});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.useRealTimers();});
it('requests audio only and releases capture when unmounted',async()=>{
 const media=stream();getUserMedia.mockResolvedValue(media);const {result,unmount}=renderHook(useMicrophone);
 expect(getUserMedia).not.toHaveBeenCalled();await act(()=>result.current.start());
 expect(result.current.status).toBe('listening');expect(getUserMedia).toHaveBeenCalledWith(expect.objectContaining({video:false}));
 unmount();expect(media.track.stop).toHaveBeenCalledOnce();expect(contexts[0].close).toHaveBeenCalledOnce();expect(contexts[0].source.disconnect).toHaveBeenCalledOnce();
});
it('disposes a late permission grant after cancellation',async()=>{
 let grant!:(value:unknown)=>void;getUserMedia.mockReturnValue(new Promise(resolve=>grant=resolve));const {result}=renderHook(useMicrophone);
 let pending!:Promise<void>;act(()=>{pending=result.current.start();});expect(result.current.status).toBe('requesting');
 act(()=>result.current.stop());const media=stream();await act(async()=>{grant(media);await pending;});
 expect(media.track.stop).toHaveBeenCalledOnce();expect(result.current.status).toBe('idle');expect(contexts[0].createMediaStreamSource).not.toHaveBeenCalled();
});
it('permission denial is recoverable and closes the audio context',async()=>{
 getUserMedia.mockRejectedValue(new DOMException('Denied','NotAllowedError'));const {result}=renderHook(useMicrophone);
 await act(()=>result.current.start());expect(result.current.error).toContain('Brak zgody');expect(contexts[0].close).toHaveBeenCalled();
 getUserMedia.mockResolvedValue(stream());await act(()=>result.current.start());expect(result.current.status).toBe('listening');expect(result.current.error).toBe('');
});
it('stops capture when page is hidden',async()=>{
 const media=stream();getUserMedia.mockResolvedValue(media);const {result}=renderHook(useMicrophone);await act(()=>result.current.start());
 act(()=>window.dispatchEvent(new Event('pagehide')));expect(media.track.stop).toHaveBeenCalled();expect(result.current.status).toBe('idle');
});
it('handles device disconnect without retaining the last note',async()=>{
 const media=stream();getUserMedia.mockResolvedValue(media);const {result}=renderHook(useMicrophone);await act(()=>result.current.start());
 act(()=>media.track.onended!());expect(result.current.status).toBe('error');expect(result.current.error).toContain('odłączony');expect(result.current.reading.pitch).toBeNull();
});
it('reports an interrupted iPhone audio context instead of silently clearing the tuner',async()=>{
 vi.useFakeTimers();const media=stream();getUserMedia.mockResolvedValue(media);const {result}=renderHook(useMicrophone);await act(()=>result.current.start());
 contexts[0].state='interrupted';act(()=>vi.advanceTimersByTime(80));
 expect(result.current.status).toBe('error');expect(result.current.error).toContain('System przerwał');expect(media.track.stop).toHaveBeenCalledOnce();
});
it('distinguishes missing microphone data from merely quiet notes and allows restart',async()=>{
 vi.useFakeTimers();getUserMedia.mockResolvedValue(stream());const {result}=renderHook(useMicrophone);await act(()=>result.current.start());
 act(()=>vi.advanceTimersByTime(3300));expect(result.current.status).toBe('listening');expect(result.current.error).toContain('nie przekazuje sygnału');
 await act(()=>result.current.start());expect(result.current.error).toBe('');expect(contexts[0].close).toHaveBeenCalledOnce();
});
