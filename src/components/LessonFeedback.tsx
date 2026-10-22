import {useEffect,useRef,useState} from 'react';
import {MessageSquare,Send} from 'lucide-react';
import {curriculumVersion} from '../content/catalog';
import {feedbackCategories,fetchFeedback,submitFeedback} from '../feedback';
import type {Feedback,FeedbackCategory,FeedbackInput} from '../feedback';
import type {Lesson} from '../types';
import {FeedbackCard} from './FeedbackCard';

export function LessonFeedback({lesson,userId,onLogin,onAll,onDirty}:{lesson:Lesson;userId?:string;onLogin:()=>void;onAll:()=>void;onDirty:(dirty:boolean)=>void}){
 const [body,setBody]=useState(''),[category,setCategory]=useState<FeedbackCategory>('unclear');
 const [rows,setRows]=useState<Feedback[]>([]),[count,setCount]=useState(0),[loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[refresh,setRefresh]=useState(0);
 const [error,setError]=useState(''),[loadError,setLoadError]=useState(''),[message,setMessage]=useState('');
 const pending=useRef<FeedbackInput|null>(null),sending=useRef(false);
 const dirty=body.trim().length>0;
 useEffect(()=>{onDirty(dirty);return()=>onDirty(false);},[dirty,onDirty]);
 useEffect(()=>{if(!dirty)return;const warn=(e:BeforeUnloadEvent)=>e.preventDefault();window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 useEffect(()=>{let active=true;if(!userId)return;setLoading(true);setLoadError('');void fetchFeedback({userId,lessonId:lesson.id}).then(result=>{if(active){setRows(result.rows);setCount(result.count);}}).catch(e=>{if(active)setLoadError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[userId,lesson.id,refresh]);
 async function send(){
  if(!userId||sending.current||body.trim().length<3)return;
  sending.current=true;setBusy(true);setError('');setMessage('');
  if(!pending.current||pending.current.body!==body.trim()||pending.current.category!==category)pending.current={id:crypto.randomUUID(),lessonId:lesson.id,version:curriculumVersion,category,body:body.trim()};
  try{await submitFeedback(pending.current);pending.current=null;setBody('');setMessage('Feedback zapisany w chmurze. Administrator może go już przeczytać.');setRefresh(v=>v+1);}
  catch(e){setError((e as Error).message);}finally{sending.current=false;setBusy(false);}
 }
 return <section className="lesson-section feedback-section" aria-labelledby="lesson-feedback-heading">
  <div className="section-label"><MessageSquare size={16}/> POMÓŻ ULEPSZYĆ PROGRAM</div><h2 id="lesson-feedback-heading">Feedback do lekcji</h2>
  <p>Co było niejasne, za trudne albo czego zabrakło? Ta wiadomość trafi do administratora. Twoje prywatne notatki pozostają osobno.</p>
  {!userId?<div className="feedback-login"><p>Zaloguj się, aby zapisywać uwagi i później zebrać je ze wszystkich urządzeń.</p><button className="secondary" onClick={onLogin}>Zaloguj się, aby dodać feedback</button></div>:<>
   <form autoComplete="off" onSubmit={e=>{e.preventDefault();void send();}}>
    <label>Temat uwagi<select value={category} disabled={busy} onChange={e=>setCategory(e.target.value as FeedbackCategory)}>{Object.entries(feedbackCategories).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
    <label>Twoja uwaga dla administratora<textarea name="lesson-feedback-body" autoComplete="off" autoCapitalize="sentences" spellCheck value={body} minLength={3} maxLength={5000} required disabled={busy} onChange={e=>{setBody(e.target.value);setMessage('');}} placeholder="Np. nie rozumiem, na której strunie zacząć ćwiczenie. Przydałby się przykład w wolnym tempie."/></label>
    <div className="feedback-submit"><span className="small muted">{body.length}/5000 · zapis po wysłaniu, wymaga internetu</span><button type="submit" className="primary" disabled={busy||body.trim().length<3}><Send size={16}/>{busy?'Wysyłam…':'Wyślij feedback'}</button></div>
   </form>
   {error&&<p role="alert" className="feedback-error">{error}</p>}{message&&<p role="status" className="feedback-success">{message}</p>}
   <div className="feedback-history-heading"><h3>Twoje uwagi do tej lekcji</h3><button className="text-button" onClick={onAll}>Cały feedback i eksport</button></div>
   {loading&&<p role="status">Pobieram uwagi…</p>}{loadError&&<div role="alert"><p>{loadError}</p><button className="secondary" onClick={()=>setRefresh(v=>v+1)}>Ponów odczyt uwag</button></div>}
   {!loading&&!loadError&&rows.length===0&&<p className="muted">Jeszcze bez uwag. Możesz dopisywać kolejne po każdej sesji.</p>}
   {rows.map(row=><FeedbackCard key={row.id} row={row}/>)}{count>rows.length&&<p>Pokazano ostatnie {rows.length} z {count} uwag. Pozostałe znajdziesz w pełnej historii.</p>}
  </>}
 </section>;
}
