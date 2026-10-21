import { useState } from 'react';
import { Check, ExternalLink, Play, Music2 } from 'lucide-react';
import type { AppState, Song, SongProgress } from '../types';
import { BpmInput } from './BpmInput';

export function SongPractice({song,state,update,disabled=false}:{song:Song;state:AppState;update:(fn:(s:AppState)=>AppState)=>void;disabled?:boolean}){
 const p=state.songs[song.id]??{status:'todo',bpm:60,notes:''};
 const [checks,setChecks]=useState<string[]>([]);
 const criteria=song.criteria??['Gram wskazane ćwiczenie w równym pulsie i potrafię je powtórzyć.'];
 function patch(part:Partial<SongProgress>){update(s=>({...s,songs:{...s.songs,[song.id]:{...(s.songs[song.id]??{status:'todo',bpm:60,notes:''}),...part}}}));}
 return <div className="song-practice">
  <div className="song-version"><Music2 size={18}/><div><strong>Wersja do zaliczenia</strong><p>{song.version}</p></div></div>
  {song.sessions&&<p className="small muted">Zaplanuj około {song.sessions[0]}–{song.sessions[1]} krótkich podejść. To wskazówka, nie termin.</p>}
  {song.url&&<><a className="primary video-link" href={song.url} target="_blank" rel="noreferrer"><Play size={17}/> Otwórz lekcję na YouTube <ExternalLink size={15}/></a><p className="small muted">{song.teacher??'Lekcja zewnętrzna'} · {song.language??'EN'} · film bezpłatny, dodatkowe materiały mogą być płatne.</p></>}
  {song.extraUrl&&<a className="text-button" href={song.extraUrl} target="_blank" rel="noreferrer">Druga część lekcji <ExternalLink size={14}/></a>}
  {song.nylon&&<div className="nylon-note"><strong>Na Twojej gitarze klasycznej</strong><p>{song.nylon}</p></div>}
  <h3>Plan pracy z utworem</h3><ol className="song-plan">{(song.practice??[song.example,'Wyizoluj trudne przejście i powtórz wolno.','Połącz całość i sprawdź ją w następnej sesji.']).map((step,i)=><li key={i}>{step}</li>)}</ol>
  <fieldset className="song-criteria" disabled={disabled||p.status==='done'}><legend>Kryteria tej wersji</legend>{criteria.map(c=><label className="criterion" key={c}><input type="checkbox" checked={p.status==='done'||checks.includes(c)} onChange={e=>setChecks(old=>e.target.checked?[...old,c]:old.filter(x=>x!==c))}/><span>{c}</span></label>)}</fieldset>
  {p.status==='done'?<div className="song-ready"><strong><Check size={18}/> Utwór gotowy</strong><button className="text-button" disabled={disabled} onClick={()=>{patch({status:'practicing'});setChecks([]);}}>Wróć do ćwiczenia utworu</button></div>:<div className="song-actions"><button className="primary" disabled={disabled||!criteria.every(c=>checks.includes(c))} onClick={()=>patch({status:'done'})}><Check size={17}/> Potwierdzam wykonanie utworu</button><button className="secondary" disabled={disabled||p.status==='practicing'} onClick={()=>patch({status:'practicing'})}>{p.status==='practicing'?'W trakcie ćwiczenia':'Zapisz utwór jako „ćwiczę”'}</button></div>}
  <div className="song-journal"><label>Aktualne tempo (BPM)<BpmInput value={p.bpm} onChange={bpm=>patch({bpm})}/></label><label>Dziennik utworu<textarea value={p.notes} maxLength={10000} placeholder="Data, zakres, tempo, trudne przejście. Co poprawić następnym razem?" onChange={e=>patch({notes:e.target.value})}/></label></div>
  <p className="small muted">Oceniasz własne wykonanie. Gotowość utworu nie nalicza XP — punkty dostajesz za zaliczenie sceny. Cofnięcie utworu nie usuwa historycznego zaliczenia sceny.</p>
 </div>;
}
