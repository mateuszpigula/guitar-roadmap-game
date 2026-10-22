// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
const audio=vi.hoisted(()=>({audioContext:vi.fn(),tone:vi.fn()}));
vi.mock('../audio',()=>audio);
import {Metronome} from './Metronome';
let context:{state:string;currentTime:number};let cancellations:Array<ReturnType<typeof vi.fn>>;
beforeEach(()=>{vi.useFakeTimers();vi.clearAllMocks();context={state:'running',currentTime:0};cancellations=[];audio.audioContext.mockResolvedValue(context);audio.tone.mockImplementation(()=>{const cancel=vi.fn();cancellations.push(cancel);return cancel;});});
afterEach(()=>{cleanup();vi.useRealTimers();});
async function start(){await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Uruchom metronom'})));}
it('starts audio on demand, schedules audible beats, cancels on stop',async()=>{render(<Metronome/>);expect(audio.audioContext).not.toHaveBeenCalled();await start();expect(audio.tone).toHaveBeenCalledWith(context,81,.07,.065,.35);fireEvent.click(screen.getByRole('button',{name:'Zatrzymaj metronom'}));expect(cancellations[0]).toHaveBeenCalledOnce();act(()=>{context.currentTime=3;vi.advanceTimersByTime(3000);});expect(audio.tone).toHaveBeenCalledTimes(1);});
it('stops on audio interruption and lets the user restart explicitly',async()=>{render(<Metronome/>);await start();act(()=>{context.state='interrupted';vi.advanceTimersByTime(30);});expect(screen.getByRole('alert').textContent).toContain('przerwany');expect(screen.getByRole('button',{name:'Uruchom metronom'})).toBeTruthy();context.state='running';await start();expect(screen.queryByRole('alert')).toBeNull();});
it('ignores a late audio resume after cancellation',async()=>{let resume!:(value:unknown)=>void;audio.audioContext.mockReturnValue(new Promise(resolve=>resume=resolve));render(<Metronome/>);fireEvent.click(screen.getByRole('button',{name:'Uruchom metronom'}));fireEvent.click(screen.getByRole('button',{name:'Anuluj uruchamianie metronomu'}));await act(async()=>resume(context));expect(audio.tone).not.toHaveBeenCalled();});
it('releases scheduled sounds and timers on unmount',async()=>{const {unmount}=render(<Metronome compact/>);await start();unmount();expect(cancellations[0]).toHaveBeenCalledOnce();act(()=>vi.advanceTimersByTime(3000));expect(audio.tone).toHaveBeenCalledTimes(1);});
it('provides retry after a rejected audio start',async()=>{audio.audioContext.mockRejectedValueOnce(Error('Blocked'));render(<Metronome/>);await start();expect(screen.getByRole('alert').textContent).toContain('Nie udało');await start();expect(screen.queryByRole('alert')).toBeNull();});
it('allows entering a new tempo without clamping partially typed digits',()=>{render(<Metronome compact/>);const field=screen.getByRole('spinbutton',{name:'Tempo metronomu w BPM'}) as HTMLInputElement;fireEvent.change(field,{target:{value:'9'}});expect(field.value).toBe('9');fireEvent.change(field,{target:{value:'90'}});fireEvent.blur(field);expect(field.value).toBe('90');});
