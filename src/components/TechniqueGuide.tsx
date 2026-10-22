import {ExternalLink} from 'lucide-react';
import {techniqueVideos} from '../data/lessonRefinements';
function StrokeDiagram({rest}:{rest:boolean}){
 return <svg viewBox="0 0 300 150" role="img" aria-label={rest?'Apoyando: palec szarpie strunę 1 i opiera się na strunie 2.':'Tirando: palec szarpie strunę 1 i kończy ruch bez dotknięcia struny 2.'}>
  <path d="M105 38H280 M105 112H280" className="guide-strings"/>
  <text x="5" y="42">2 · B</text><text x="5" y="116">1 · E</text>
  <circle cx="140" cy="112" r="7" className="guide-start"/>
  {rest?<><path d="M140 102Q161 78 175 45" className="guide-movement"/><path d="m164 49 12-10 3 16" className="guide-movement"/><circle cx="177" cy="38" r="7" className="guide-end"/></>:<><path d="M147 108Q185 71 233 78" className="guide-movement"/><path d="m222 69 12 9-13 6" className="guide-movement"/><circle cx="244" cy="78" r="7" className="guide-end"/></>}
  <text x="116" y="141">start</text>
 </svg>;
}
export function TechniqueGuide({lessonId}:{lessonId:string}){
 const pima=lessonId==='ch-01-4',strokes=lessonId==='deep-01-2';if(!pima&&!strokes)return null;
 const video=pima?techniqueVideos.pima:techniqueVideos.strokes;
 return <section className="technique-guide" aria-label="Technika krok po kroku">
  <span className="section-label">NAJPIERW ZOBACZ RUCH</span>
  <h2>{pima?'Który palec, która struna?':'Gdzie kończy się ruch palca?'}</h2>
  {pima?<><div className="finger-key">{[['p','Kciuk','5 · A'],['i','Wskazujący','3 · G'],['m','Środkowy','2 · B'],['a','Serdeczny','1 · E']].map(([letter,name,string])=><div key={letter}><b>{letter}</b><strong>{name}</strong><span>struna {string}</span></div>)}</div><p><strong>Zagraj po kolei: p → i → m → a.</strong> Lewa dłoń niczego nie dociska. Zacznij bez metronomu, z pauzą po każdym dźwięku.</p><p>Litera to palec szarpiący, cyfra to numer struny. Ten przydział strun jest tylko do tego ćwiczenia.</p></>:<><div className="stroke-comparison"><div><h3>Tirando <small>free stroke</small></h3><StrokeDiagram rest={false}/><p>Po szarpnięciu struny 1 palec zostaje <strong>w powietrzu</strong>. Nie dotyka struny 2.</p></div><div><h3>Apoyando <small>rest stroke</small></h3><StrokeDiagram rest/><p>Po szarpnięciu struny 1 palec opiera się <strong>na strunie 2</strong>, ale jej nie szarpie.</p></div></div><p className="small">Schemat końca ruchu, nie rysunek ułożenia dłoni. Dotyczy i–m na strunie 1; sąsiednia grubsza struna to 2. Zagraj najpierw po jednym dźwięku, bez kliku.</p></>}
  <a className="technique-video" href={video.url} target="_blank" rel="noreferrer"><ExternalLink size={18}/>{video.label}</a><p className="small muted">{video.note}</p>
 </section>;
}
