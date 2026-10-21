import {useEffect,useRef,useState} from 'react';
import {Download,MessageSquare} from 'lucide-react';
import {lessons} from '../content/catalog';
import {downloadFeedback,exportFeedback,fetchFeedback,feedbackCount} from '../feedback';
import type {Feedback,FeedbackScope} from '../feedback';
import {FeedbackCard} from './FeedbackCard';

export default function FeedbackInbox({userId,admin,onLogin}:{userId?:string;admin:boolean;onLogin:()=>void}){
 const [scope,setScope]=useState<FeedbackScope>('mine'),[lessonId,setLessonId]=useState(''),[rows,setRows]=useState<Feedback[]>([]),[count,setCount]=useState(0);
 const [hasMore,setHasMore]=useState(false);
 const [busy,setBusy]=useState(false),[exporting,setExporting]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[refresh,setRefresh]=useState(0);
 const generation=useRef(0),loadingMore=useRef(false);
 const effectiveScope=admin?scope:'mine';
 useEffect(()=>{const run=++generation.current;setRows([]);setCount(0);setHasMore(false);if(!userId)return;setBusy(true);setError('');setMessage('');void fetchFeedback({userId,scope:effectiveScope,lessonId:lessonId||undefined}).then(result=>{if(run===generation.current){setRows(result.rows);setCount(result.count);setHasMore(result.hasMore);}}).catch(e=>{if(run===generation.current)setError(e.message);}).finally(()=>{if(run===generation.current)setBusy(false);});return()=>{generation.current++;};},[userId,effectiveScope,lessonId,refresh]);
 async function more(){if(!userId||loadingMore.current)return;loadingMore.current=true;const run=generation.current;setBusy(true);setError('');try{const result=await fetchFeedback({userId,scope:effectiveScope,lessonId:lessonId||undefined,cursor:rows.at(-1)});if(run===generation.current){setRows(old=>[...old,...result.rows.filter(r=>!old.some(x=>x.id===r.id))]);setHasMore(result.hasMore);}}catch(e){if(run===generation.current)setError((e as Error).message);}finally{loadingMore.current=false;if(run===generation.current)setBusy(false);}}
 async function download(){const run=generation.current;setExporting(true);setError('');setMessage('');try{const result=await exportFeedback(effectiveScope);if(run!==generation.current)return;downloadFeedback(result);setMessage(`Pobrano cały feedback: ${feedbackCount(result.count)}. Plik jest gotowy do dołączenia w rozmowie.`);}catch(e){setError((e as Error).message);}finally{setExporting(false);}}
 return <section className="feedback-inbox"><header className="page-heading"><span className="eyebrow">Z DOŚWIADCZENIA DO LEPSZYCH LEKCJI</span><h1>Feedback<span>.</span></h1><p>Twoje obserwacje z ćwiczeń, zebrane w jednym miejscu.</p></header>
  {!userId?<div className="panel"><p>Zaloguj się, aby zobaczyć zapisane uwagi.</p><button className="primary" onClick={onLogin}>Otwórz logowanie</button></div>:<>
   <section className="panel feedback-export"><div><span className="section-label"><MessageSquare size={16}/> WRÓĆ Z TYM DO ROZMOWY</span><h2>Uwagi gotowe do wspólnej analizy</h2><p>Po kilku dniach lub tygodniach pobierz plik JSON i dołącz go do rozmowy z asystentem. Zawiera wszystkie uwagi z wybranego zakresu oraz treść i wersję każdej lekcji w chwili zgłoszenia.</p><p className="small muted">Eksport obejmuje także uwagi przeczytane i wdrożone. Filtr lekcji poniżej nie ogranicza eksportu. Plik nie zawiera Twoich prywatnych notatek ani adresów e-mail.</p></div>
    <button className="primary" disabled={exporting} onClick={()=>void download()}><Download size={17}/>{exporting?'Przygotowuję cały eksport…':effectiveScope==='all'?'Eksportuj feedback wszystkich osób':'Eksportuj cały mój feedback'}</button>
   </section>
   <div className="feedback-filters">{admin&&<label>Zakres<select value={scope} disabled={exporting} onChange={e=>setScope(e.target.value as FeedbackScope)}><option value="mine">Mój feedback</option><option value="all">Wszystkie osoby · administrator</option></select></label>}<label>Lekcja<select value={lessonId} disabled={exporting} onChange={e=>setLessonId(e.target.value)}><option value="">Wszystkie lekcje</option>{lessons.map(l=><option key={l.id} value={l.id}>{l.chapter}. {l.title}</option>)}</select></label><button className="secondary" disabled={busy||exporting} onClick={()=>setRefresh(v=>v+1)}>Odśwież listę</button></div>
   {error&&<p role="alert" className="feedback-error">{error}</p>}{message&&<p role="status" className="feedback-success">{message}</p>}
   <p className="muted" aria-live="polite">{busy?'Pobieram feedback…':`${feedbackCount(count)} w tym widoku`}</p>
   {!busy&&!error&&count===0&&<div className="panel feedback-empty"><MessageSquare size={28}/><h2>Tu zacznie się kolejna wersja programu</h2><p>Otwórz dowolną lekcję i dodaj uwagę w sekcji „Feedback do lekcji”, pod prywatnymi notatkami.</p></div>}
   <div className="feedback-list">{rows.map(row=><FeedbackCard key={row.id} row={row} admin={admin} onChanged={changed=>setRows(old=>old.map(r=>r.id===changed.id?changed:r))}/>)}</div>
   {hasMore&&<button className="secondary" disabled={busy} onClick={()=>void more()}>Pokaż kolejne uwagi ({rows.length}/{count})</button>}
  </>}
 </section>;
}
