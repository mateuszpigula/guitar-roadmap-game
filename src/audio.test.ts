// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
let created:FakeContext[];
class FakeContext{
 state='suspended';resume=vi.fn(async()=>{this.state='running';});
 constructor(){created.push(this);}
}
beforeEach(()=>{vi.resetModules();created=[];vi.stubGlobal('AudioContext',FakeContext);Object.defineProperty(navigator,'audioSession',{configurable:true,value:{type:'auto'}});});
afterEach(()=>{vi.unstubAllGlobals();});
it('creates and resumes synchronously when called by a click handler',async()=>{const {audioContext}=await import('./audio');const ready=audioContext();expect(created).toHaveLength(1);expect(created[0].resume).toHaveBeenCalledOnce();await ready;expect((navigator as unknown as {audioSession:{type:string}}).audioSession.type).toBe('playback');});
it('resumes interrupted Safari contexts and recreates closed contexts',async()=>{const {audioContext}=await import('./audio');await audioContext();created[0].state='interrupted';await audioContext();expect(created[0].resume).toHaveBeenCalledTimes(2);created[0].state='closed';await audioContext();expect(created).toHaveLength(2);});
it('reports failure instead of pretending a still suspended context is playing',async()=>{const {audioContext}=await import('./audio');await audioContext();created[0].state='suspended';created[0].resume.mockImplementation(async()=>{});await expect(audioContext()).rejects.toThrow('Audio nie jest aktywne');});
it('keeps the recording category while any microphone owns a session',async()=>{const {recordingAudioSession,audioContext}=await import('./audio');const session=(navigator as unknown as {audioSession:{type:string}}).audioSession;const release1=recordingAudioSession(),release2=recordingAudioSession();await audioContext();expect(session.type).toBe('play-and-record');release1();release1();expect(session.type).toBe('play-and-record');release2();expect(session.type).toBe('playback');});
it('works when the optional audio session API is absent',async()=>{Object.defineProperty(navigator,'audioSession',{configurable:true,value:undefined});const {audioContext}=await import('./audio');expect((await audioContext()).state).toBe('running');});
