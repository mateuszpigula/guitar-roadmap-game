// @vitest-environment jsdom
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {playNotes} from '../audio';
import {EarQuiz} from './EarQuiz';
vi.mock('../audio',async importOriginal=>({...await importOriginal<typeof import('../audio')>(),playNotes:vi.fn().mockResolvedValue(undefined)}));
beforeEach(()=>{vi.spyOn(Math,'random').mockReturnValue(0);vi.mocked(playNotes).mockResolvedValue(undefined);});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.clearAllMocks();});
async function play(){fireEvent.click(screen.getByRole('button',{name:'Odtwórz przykład'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Posłuchaj jeszcze raz'})).toBeTruthy());}
it('explains the exercise before playing and reveals exact notes only after answering',async()=>{
 render(<EarQuiz/>);
 expect(screen.getByText('Na czym polega to ćwiczenie?')).toBeTruthy();
 expect(screen.queryByText('Zagrane dźwięki')).toBeNull();
 expect((screen.getByRole('button',{name:'Tercja mała'}) as HTMLButtonElement).disabled).toBe(true);
 await play();expect(playNotes).toHaveBeenCalledWith([48,51],false);
 expect(screen.queryByText('C3 → E♭3')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Tercja wielka'}));
 expect(screen.getByText('C3 → E♭3')).toBeTruthy();
 expect(screen.getByText('Poprawna odpowiedź: Tercja mała.')).toBeTruthy();
 expect(screen.getByLabelText('Wynik: 0 z 1')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Posłuchaj dźwięku 2: E♭3'}));
 expect(playNotes).toHaveBeenLastCalledWith([51],false);
 fireEvent.click(screen.getByRole('button',{name:'Następny'}));
 expect(screen.queryByText('Zagrane dźwięki')).toBeNull();
 expect((screen.getByRole('button',{name:'Tercja mała'}) as HTMLButtonElement).disabled).toBe(true);
});
it.each([
 ['Kierunek','W dół','C3 → B♭2',[48,46],false],
 ['Dur / moll','Moll','C3 + E♭3 + G3',[48,51,55],true],
 ['Dźwięki','C','C3',[48],false],
] as const)('shows the actual pitches and playback order for %s',async(mode,answer,notes,midis,together)=>{
 render(<EarQuiz/>);fireEvent.click(screen.getByRole('button',{name:mode}));await play();
 expect(playNotes).toHaveBeenLastCalledWith([...midis],together);
 fireEvent.click(screen.getByRole('button',{name:answer}));
 expect(screen.getByText(notes,{selector:'.ear-note-sequence'})).toBeTruthy();
 expect(screen.getByLabelText('Wynik: 1 z 1')).toBeTruthy();
});
it('does not unlock answers after a reference tone or a failed playback',async()=>{
 render(<EarQuiz/>);fireEvent.click(screen.getByRole('button',{name:'Dźwięki'}));
 fireEvent.click(screen.getByRole('button',{name:'Posłuchaj C4'}));
 await act(async()=>{});
 expect(playNotes).toHaveBeenCalledWith([60],false);
 expect((screen.getByRole('button',{name:'C'}) as HTMLButtonElement).disabled).toBe(true);
 vi.mocked(playNotes).mockRejectedValueOnce(new Error('blocked'));
 fireEvent.click(screen.getByRole('button',{name:'Odtwórz przykład'}));
 expect(await screen.findByRole('alert')).toBeTruthy();
 expect(screen.queryByText('Zagrane dźwięki')).toBeNull();
});
it('ignores playback completion from a previous mode',async()=>{
 let finish!:()=>void;vi.mocked(playNotes).mockReturnValueOnce(new Promise<void>(resolve=>{finish=resolve;}));
 render(<EarQuiz/>);fireEvent.click(screen.getByRole('button',{name:'Odtwórz przykład'}));
 fireEvent.click(screen.getByRole('button',{name:'Kierunek'}));
 await act(async()=>finish());
 expect((screen.getByRole('button',{name:'W dół'}) as HTMLButtonElement).disabled).toBe(true);
});
