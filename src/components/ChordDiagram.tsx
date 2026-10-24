import {chords,chordFingers,lessonChords} from '../data/chords';
export function ChordDiagram({name='Em'}:{name?:string}){
 const values=chords[name],fingers=chordFingers[name];if(!values)return null;
 return <svg className="chord" viewBox="0 0 180 190" role="img" aria-label={`Akord ${name}. Od struny 6 do 1: ${values.map((v,i)=>v<0?'pomiń':v===0?'pusta':`próg ${v}, palec ${fingers[i]}`).join('; ')}.`}>
  <text x="90" y="20" textAnchor="middle" fontSize="20" fontWeight="600">{name}</text>
  {[0,1,2,3,4].map(i=><line key={i} x1="30" y1={50+i*27} x2="150" y2={50+i*27} stroke="currentColor" strokeWidth={i===0?4:1}/>)}
  {values.map((v,i)=><g key={i}><line x1={30+i*24} y1="50" x2={30+i*24} y2="158" stroke="currentColor"/><text x={30+i*24} y="41" fontSize="13" textAnchor="middle">{v<0?'×':v===0?'○':''}</text>{v>0&&<><circle cx={30+i*24} cy={50+(v-.5)*27} r="10" className="chord-finger-dot"/><text x={30+i*24} y={54+(v-.5)*27} textAnchor="middle" fontSize="12" fontWeight="600" className="chord-finger-number">{fingers[i]}</text></>}<text x={30+i*24} y="180" fontSize="11" textAnchor="middle">{6-i}</text></g>)}
 </svg>;
}
export function LessonChords({lessonId}:{lessonId:string}){
 const names=lessonChords[lessonId];if(!names)return null;
 return <section className="lesson-chords" aria-label="Ściąga akordów"><span className="section-label">POD RĘKĄ</span><h2>Akordy do tego ćwiczenia</h2><p className="small">Widok gryfu z przodu. Struny od lewej: 6 (gruba) → 1 (cienka). ○ = pusta, × = pomiń. Cyfra w kropce to palec lewej dłoni: 1 wskazujący, 2 środkowy, 3 serdeczny, 4 mały.</p><div className="lesson-chord-grid">{names.map(name=><figure key={name}><ChordDiagram name={name}/><figcaption><span className="mono">{chords[name].map(n=>n<0?'X':n).join(' ')}</span><small>Progi od struny 6 do 1</small></figcaption></figure>)}</div><p className="small">Zagraj po jednej dozwolonej strunie, żeby sprawdzić chwyt. Ten sam akord może mieć różne palcowania; tutaj ćwicz pokazany wariant.</p></section>;
}
