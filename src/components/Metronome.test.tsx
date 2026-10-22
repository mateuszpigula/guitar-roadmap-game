// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {Metronome} from './Metronome';
let play:ReturnType<typeof vi.spyOn>,pause:ReturnType<typeof vi.spyOn>;
beforeEach(()=>{
 vi.useFakeTimers();play=vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();pause=vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});
 vi.stubGlobal('URL',Object.assign(URL,{createObjectURL:vi.fn(()=>'blob:test'),revokeObjectURL:vi.fn()}));
});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function start(){await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Uruchom metronom'})));}
it('starts native looped audio on demand and releases the track on stop',async()=>{
 const {container}=render(<Metronome/>);expect(play).not.toHaveBeenCalled();await start();
 const audio=container.querySelector('audio')!;expect(audio.loop).toBe(true);expect(audio.src).toBe('blob:test');
 fireEvent.click(screen.getByRole('button',{name:'Zatrzymaj metronom'}));expect(audio.getAttribute('src')).toBeNull();expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
});
it('does not stop on screen lock or hidden page; timers only paint the beat',async()=>{
 render(<Metronome/>);await start();pause.mockClear();
 act(()=>{vi.spyOn(document,'hidden','get').mockReturnValue(true);document.dispatchEvent(new Event('visibilitychange'));vi.advanceTimersByTime(120000);});
 expect(pause).not.toHaveBeenCalled();expect(play).toHaveBeenCalledTimes(1);expect(screen.getByRole('button',{name:'Zatrzymaj metronom'})).toBeTruthy();
});
it('reports an OS pause and allows explicit restart',async()=>{
 const {container}=render(<Metronome/>);await start();act(()=>container.querySelector('audio')!.dispatchEvent(new Event('pause')));
 expect(screen.getByRole('alert').textContent).toContain('system');await start();expect(screen.queryByRole('alert')).toBeNull();
});
it('ignores late play resolution after cancellation',async()=>{
 let resume!:()=>void;play.mockReturnValueOnce(new Promise<void>(resolve=>resume=resolve));
 render(<Metronome/>);fireEvent.click(screen.getByRole('button',{name:'Uruchom metronom'}));fireEvent.click(screen.getByRole('button',{name:'Anuluj uruchamianie metronomu'}));
 await act(async()=>resume());expect(screen.getByRole('button',{name:'Uruchom metronom'})).toBeTruthy();
});
it('releases native playback on unmount',async()=>{const {unmount}=render(<Metronome compact/>);await start();pause.mockClear();unmount();expect(pause).toHaveBeenCalledOnce();expect(URL.revokeObjectURL).toHaveBeenCalled();});
it('provides retry after rejected playback',async()=>{play.mockRejectedValueOnce(Error('Blocked'));render(<Metronome/>);await start();expect(screen.getByRole('alert').textContent).toContain('Nie udało');await start();expect(screen.queryByRole('alert')).toBeNull();});
it('changes tempo and meter by replacing the native track while playing',async()=>{
 render(<Metronome/>);await start();await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Zwiększ tempo'})));
 await act(async()=>fireEvent.change(screen.getByRole('combobox',{name:'Metrum metronomu'}),{target:{value:'3'}}));
 expect(play).toHaveBeenCalledTimes(3);expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);expect(screen.getByRole('button',{name:'Zatrzymaj metronom'})).toBeTruthy();
});
it('allows typing a new tempo without clamping partial digits',()=>{render(<Metronome compact/>);const field=screen.getByRole('spinbutton',{name:'Tempo metronomu w BPM'}) as HTMLInputElement;fireEvent.change(field,{target:{value:'9'}});expect(field.value).toBe('9');fireEvent.change(field,{target:{value:'90'}});fireEvent.blur(field);expect(field.value).toBe('90');});
