import {BookOpen,ExternalLink} from 'lucide-react';
import type {Lesson} from '../types';
import {songById,sources} from '../content/catalog';

export function LessonMaterial({lesson,selectedSongId}:{lesson:Lesson;selectedSongId?:string}){
 const song=selectedSongId&&lesson.songChoices?.includes(selectedSongId)?songById[selectedSongId]:undefined;
 const source=lesson.songChoices
  ?song?.url?{title:`${song.title} · ${song.teacher??song.artist}`,url:song.url,language:song.language??'EN',access:'Bezpłatny film do wybranej wersji utworu'}:undefined
  :sources[lesson.source];
 return <section className="lesson-section"><h2>Warto zobaczyć</h2>{source?<><a className="source-link" href={source.url} target="_blank" rel="noreferrer"><BookOpen size={22}/><span><strong>{source.title}</strong><small>{source.language} · {source.access}</small></span><ExternalLink size={17}/></a><p className="small muted">{lesson.songChoices?'Film odpowiada Twojemu wyborowi powyżej. Ćwicz wersję i zakres opisany w planie utworu.':'Materiał uzupełniający. Ćwiczenie powyżej możesz wykonać bez zakupu kursu.'}</p></>:<p>Wybierz utwór na początku tej lekcji. Tutaj pojawi się film do wybranej wersji.</p>}</section>;
}
