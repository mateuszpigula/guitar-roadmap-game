// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import type {Reading} from '../microphone/pitch';
const fake=vi.hoisted(()=>({status:'listening',error:'',start:vi.fn(),stop:vi.fn(),reading:{pitch:null,level:0,clipped:false,at:0} as Reading}));
vi.mock('../microphone/useMicrophone',()=>({useMicrophone:()=>fake}));
import {MicrophonePractice} from './MicrophonePractice';
beforeEach(()=>{vi.clearAllMocks();fake.status='listening';fake.reading={pitch:null,level:0,clipped:false,at:0};});
afterEach(()=>{cleanup();vi.useRealTimers();});
it('requires stable correct octave, grants one hit and waits for next click',()=>{
 const {rerender}=render(<MicrophonePractice/>);fireEvent.click(screen.getByRole('button',{name:'Znajdź dźwięk'}));
 expect(fake.stop).toHaveBeenCalledOnce();
 const send=(midi:number|null,at:number)=>{fake.reading={level:.1,clipped:false,at,pitch:midi===null?null:{midi,cents:0,frequency:440,confidence:.99}};rerender(<MicrophonePractice/>);};
 send(72,1000);send(72,1200);expect(screen.getByText('0 / 5 trafień')).toBeTruthy();
 for(let at=1400;at<=2000;at+=100)send(60,at);
 send(null,2100);send(60,2200);expect(screen.getByText('0 / 5 trafień')).toBeTruthy();
 for(let at=2300;at<=3000;at+=100)send(60,at);
 expect(screen.getByText('1 / 5 trafień')).toBeTruthy();send(60,3100);expect(screen.getByText('1 / 5 trafień')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Następny dźwięk'}));expect(screen.getByLabelText('Zagraj E4')).toBeTruthy();
 expect((screen.getByRole('button',{name:'Następny dźwięk'}) as HTMLButtonElement).disabled).toBe(true);
});
it('does not count a large gap as a sustained note',()=>{
 const {rerender}=render(<MicrophonePractice/>);fireEvent.click(screen.getByRole('button',{name:'Znajdź dźwięk'}));
 for(const at of [1000,5000]){fake.reading={pitch:{midi:60,cents:0,frequency:261.63,confidence:.99},level:.1,clipped:false,at};rerender(<MicrophonePractice/>);}
 expect(screen.getByText('0 / 5 trafień')).toBeTruthy();
});
it('shows a recent reading through a dropout without claiming the string is currently in tune',()=>{
 vi.useFakeTimers();
 const {rerender}=render(<MicrophonePractice/>);
 const send=(pitch:Reading['pitch'],at:number)=>{fake.reading={pitch,at,level:.002,clipped:false};rerender(<MicrophonePractice/>);};
 const note={midi:40,cents:0,frequency:82.4069,confidence:.98};
 send(note,1000);send(note,1080);act(()=>vi.advanceTimersByTime(400));expect(screen.getByText('Dźwięk jest nastrojony.')).toBeTruthy();
 send(null,1160);act(()=>vi.advanceTimersByTime(400));expect(screen.getByText('E2')).toBeTruthy();expect(screen.getByText('Ostatni odczyt — zagraj strunę ponownie.')).toBeTruthy();expect(screen.queryByText('Dźwięk jest nastrojony.')).toBeNull();
 send(null,2400);act(()=>vi.advanceTimersByTime(400));expect(screen.queryByText('E2')).toBeNull();
});

it('keeps the needle live while suppressing brief direction changes and sampling numerical text',()=>{
 vi.useFakeTimers();
 const {rerender,container}=render(<MicrophonePractice/>);
 let at=1000;
 const send=(cents:number)=>{at+=80;fake.reading={level:.002,clipped:false,at,pitch:{midi:40,cents,frequency:82.4069*2**(cents/1200),confidence:.99}};rerender(<MicrophonePractice/>);};
 const needle=()=>container.querySelector<HTMLElement>('.tuner-needle')!.style.left;
 send(0);send(0);act(()=>vi.advanceTimersByTime(400));
 expect(screen.getByText('Dźwięk jest nastrojony.')).toBeTruthy();
 const initial=needle(),frequency=container.querySelector('.tuner-readout>span:last-child')!.textContent;
 send(20);send(20);
 expect(needle()).not.toBe(initial);
 expect(container.querySelector('.tuner-readout>span:last-child')!.textContent).toBe(frequency);
 act(()=>vi.advanceTimersByTime(160));send(0);send(0);
 act(()=>vi.advanceTimersByTime(160));
 expect(screen.getByText('Dźwięk jest nastrojony.')).toBeTruthy();
 // A persistent change is shown even though readings keep arriving.
 for(let i=0;i<8;i++){send(-22);act(()=>vi.advanceTimersByTime(80));}
 expect(screen.getByText('Za nisko — delikatnie podwyższ dźwięk.')).toBeTruthy();
 expect(container.querySelector('.tuner-readout>span:last-child')!.textContent).not.toBe(frequency);
 // Stopping cancels an instruction waiting to appear.
 send(20);send(20);fake.status='idle';rerender(<MicrophonePractice/>);
 expect(screen.getByText('Gotowy, gdy Ty jesteś.')).toBeTruthy();
 expect(container.querySelector('.tuner-needle')).toBeNull();
 act(()=>vi.advanceTimersByTime(1000));
 expect(screen.getByText('Gotowy, gdy Ty jesteś.')).toBeTruthy();
});
it('resets text immediately when selecting a different target and clears timers on unmount',()=>{
 vi.useFakeTimers();
 const {rerender,unmount}=render(<MicrophonePractice/>);
 for(const at of [1000,1080]){fake.reading={level:.002,clipped:false,at,pitch:{midi:40,cents:0,frequency:82.4069,confidence:.99}};rerender(<MicrophonePractice/>);}
 act(()=>vi.advanceTimersByTime(400));
 expect(screen.getByText('Dźwięk jest nastrojony.')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'5 · A2'}));
 expect(screen.getByText('Za nisko — delikatnie podwyższ dźwięk.')).toBeTruthy();
 unmount();expect(vi.getTimerCount()).toBe(0);
});
