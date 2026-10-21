import { Check, Music2 } from 'lucide-react';
import type { AppState, Lesson } from '../types';
import { songById } from '../data/repertoire';
import { progressFor } from '../state';
import { SongPractice } from './SongPractice';

export function SongChallenge({lesson,state,update,available}:{lesson:Lesson;state:AppState;update:(fn:(s:AppState)=>AppState)=>void;available:boolean}){
 const progress=progressFor(state,lesson.id),selected=progress.selectedSongId? songById[progress.selectedSongId]:undefined;
 return <section className="lesson-section repertoire-challenge"><span className="section-label">TWÓJ REPERTUAR / WYBIERZ 1 Z {lesson.songChoices?.length}</span><h2>Co zagrasz na tej scenie?</h2><p>Wystarczy jedna opcja. Poziom dotyczy opisanej wersji i zakresu, nie każdej aranżacji tego utworu.</p><div className="song-options" role="group" aria-label="Wybór utworu do sceny">{lesson.songChoices?.map(id=>{const s=songById[id];return <button className={`song-option ${selected?.id===id?'selected':''}`} key={id} aria-pressed={selected?.id===id} disabled={progress.status==='done'} onClick={()=>update(old=>({...old,progress:{...old.progress,[lesson.id]:{...progressFor(old,lesson.id),selectedSongId:id}}}))}><span className="choice-icon">{selected?.id===id?<Check size={18}/>:<Music2 size={18}/>}</span><strong>{s.title}</strong><small>{s.artist}</small><p>{s.version}</p></button>;})}</div>{!available&&<p className="small muted">Możesz już wybrać utwór i zacząć ćwiczyć. Zaliczenie sceny odblokujesz po przygotowaniu podstaw.</p>}{selected?<div className="selected-song"><span className="eyebrow">TWÓJ WYBÓR</span><h2>{selected.title}</h2><SongPractice key={selected.id} song={selected} state={state} update={update}/></div>:<p className="choice-prompt">Wybierz tytuł, aby zobaczyć film, plan ćwiczeń i kryteria wykonania.</p>}{progress.status==='done'&&<p className="small muted">Wybór utworu jest częścią zaliczenia. Aby go zmienić, najpierw cofnij zaliczenie sceny.</p>}</section>;
}
