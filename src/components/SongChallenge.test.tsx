// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { SongChallenge } from './SongChallenge';
import { lessonById } from '../content/catalog';
import { freshState, progressFor, setStatus } from '../state';
import type { AppState } from '../types';
afterEach(cleanup);
function Harness({initial=freshState(),available=false}:{initial?:AppState;available?:boolean}){
 const [state,update]=useState(initial);
 return <><SongChallenge lesson={lessonById['rep-01']} state={state} update={update} available={available}/><output data-testid="state">{JSON.stringify(state)}</output></>;
}
it('allows planning a song before the scene unlocks, and checks criteria before marking it ready',()=>{
 render(<Harness/>);
 fireEvent.click(screen.getByRole('button',{name:/^Oda do radości/}));
 expect(screen.getByRole('link',{name:/Otwórz lekcję/}).getAttribute('href')).toBe('https://www.youtube.com/watch?v=iFDPa2rADfo');
 const complete=screen.getByRole('button',{name:'Potwierdzam wykonanie utworu'}) as HTMLButtonElement;
 expect(complete.disabled).toBe(true);
 screen.getAllByRole('checkbox').forEach(el=>fireEvent.click(el));expect(complete.disabled).toBe(false);fireEvent.click(complete);
 const state=JSON.parse(screen.getByTestId('state').textContent!);expect(state.songs['rep-ode-melody'].status).toBe('done');expect(state.progress['rep-01'].status).toBe('todo');expect(state.progress['rep-01'].unlocked).toBe(false);
});
it('keeps the selected song fixed after completing a scene',()=>{
 let state=freshState();state.progress['rep-01']={...progressFor(state,'rep-01'),selectedSongId:'rep-seven',unlocked:true};state.songs['rep-seven']={status:'done',notes:'',bpm:60};state=setStatus(state,'rep-01','done');
 render(<Harness initial={state} available/>);
 expect((screen.getByRole('button',{name:/^Oda do radości/}) as HTMLButtonElement).disabled).toBe(true);
 expect(screen.getByText('Utwór gotowy')).toBeTruthy();
});
