import {useState} from 'react';
import {feedbackCategories,feedbackStatuses,reviewFeedback} from '../feedback';
import type {Feedback,FeedbackStatus} from '../feedback';

export function FeedbackCard({row,admin=false,onChanged}:{row:Feedback;admin?:boolean;onChanged?:(row:Feedback)=>void}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const [comment,setComment]=useState(row.review_comment??''),[message,setMessage]=useState('');
 async function change(status:FeedbackStatus,withComment=false){
  setBusy(true);setError('');setMessage('');
  try{const updated=await reviewFeedback(row,status,withComment?comment:undefined);onChanged?.(updated);if(withComment)setMessage('Komentarz zapisany.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 return <article className="feedback-card">
  <div className="feedback-card-top"><span className={`feedback-status feedback-status-${row.status}`}>{feedbackStatuses[row.status]}</span><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString('pl-PL')}</time></div>
  <h3>{row.context.lesson.title}</h3>
  <p className="small muted">Rozdział {row.context.chapter.id} · program v{row.curriculum_version} · {feedbackCategories[row.category]}</p>
  <p className="feedback-body">{row.body}</p>
  {row.review_comment&&<section className="feedback-response" aria-label="Odpowiedź administratora"><strong>Odpowiedź administratora</strong><p>{row.review_comment}</p>{row.reviewed_at&&<small>{new Date(row.reviewed_at).toLocaleDateString('pl-PL')}</small>}</section>}
  <details><summary>Lekcja w chwili wysłania</summary><p>{row.context.lesson.theory}</p><ol>{row.context.lesson.steps.map((step,i)=><li key={i}>{step}</li>)}</ol><strong>Kryteria zaliczenia</strong><ul>{row.context.lesson.criteria.map((c,i)=><li key={i}>{c}</li>)}</ul><p className="small">ID lekcji: {row.lesson_id} · ID uwagi: {row.id}</p></details>
  {admin&&<label className="feedback-review">Status uwagi<select aria-label={`Status uwagi ${row.id}`} value={row.status} disabled={busy} onChange={e=>void change(e.target.value as FeedbackStatus)}>{Object.entries(feedbackStatuses).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>}
  {admin&&<form className="feedback-comment-form" onSubmit={e=>{e.preventDefault();void change(row.status,true);}}><label>Komentarz administratora<textarea aria-label={`Komentarz administratora ${row.id}`} name="admin-feedback-comment" autoComplete="off" value={comment} maxLength={5000} disabled={busy} onChange={e=>{setComment(e.target.value);setMessage('');}} placeholder="Co zmieniono i w której wersji?"/></label><p className="small muted">Widoczny dla autora uwagi i administratorów. Dołączany do eksportu feedbacku.</p><button className="secondary" disabled={busy||comment.trim()===(row.review_comment??'')}>Zapisz komentarz</button></form>}
  {message&&<p role="status">{message}</p>}
  {error&&<p role="alert" className="feedback-error">{error}</p>}
 </article>;
}
