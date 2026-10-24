import {cloud} from './cloud';
import type {Lesson,Chapter,Song} from './types';
import type {Source} from './content/model';

export const feedbackCategories={unclear:'Niejasne wyjaśnienie',difficulty:'Poziom trudności',material:'Film lub materiał',idea:'Pomysł na rozszerzenie',other:'Inna uwaga'} as const;
export const feedbackStatuses={new:'Nowe',read:'Przeczytane',planned:'Zaplanowane',resolved:'Wdrożone'} as const;
export function feedbackCount(count:number){const form=new Intl.PluralRules('pl').select(count);return `${count} ${form==='one'?'uwaga':form==='few'?'uwagi':'uwag'}`;}
export type FeedbackCategory=keyof typeof feedbackCategories;
export type FeedbackStatus=keyof typeof feedbackStatuses;
export type FeedbackScope='mine'|'all';
export interface Feedback {
 id:string;user_id:string;lesson_id:string;curriculum_version:number;category:FeedbackCategory;body:string;
 created_at:string;status:FeedbackStatus;revision:number;reviewed_at:string|null;review_comment?:string;
 context:{lesson:Lesson;chapter:Chapter;source:Source;prerequisites:{id:string;title:string}[];songChoices:Song[]};
}
export interface FeedbackExport {format:'guitar-quest-feedback';schemaVersion:1;exportedAt:string;scope:FeedbackScope;count:number;entries:Feedback[]}
export interface FeedbackInput {id:string;lessonId:string;version:number;category:FeedbackCategory;body:string}
const client=()=>{if(!cloud)throw Error('Feedback wymaga połączenia z kontem w chmurze.');return cloud;};
export async function submitFeedback(input:FeedbackInput):Promise<Feedback>{
 const {data,error}=await client().rpc('submit_lesson_feedback',{request_id:input.id,target_lesson:input.lessonId,program_version:input.version,feedback_category:input.category,feedback_body:input.body.trim()}).abortSignal(AbortSignal.timeout(15000)).single();
 if(error)throw Error('Nie potwierdzono zapisu. Sprawdź połączenie i ponów tę samą wysyłkę — nie utworzy duplikatu. '+error.message);
 return data as Feedback;
}
export async function fetchFeedback({userId,scope='mine',lessonId,cursor}:{userId:string;scope?:FeedbackScope;lessonId?:string;cursor?:Pick<Feedback,'id'|'created_at'>}):Promise<{rows:Feedback[];count:number;hasMore:boolean}>{
 let query=client().from('lesson_feedback').select('*',{count:'exact'}).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(51);
 if(scope==='mine')query=query.eq('user_id',userId);
 if(lessonId)query=query.eq('lesson_id',lessonId);
 if(cursor)query=query.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`);
 const {data,error,count}=await query.abortSignal(AbortSignal.timeout(15000));
 if(error)throw Error('Nie udało się pobrać feedbacku. Sprawdź połączenie i spróbuj ponownie.');
 return {rows:(data as Feedback[]).slice(0,50),count:count??0,hasMore:!!data&&data.length>50};
}
export async function reviewFeedback(row:Feedback,status:FeedbackStatus,comment?:string):Promise<Feedback>{
 const {data,error}=await client().rpc('review_lesson_feedback',{feedback_id:row.id,expected_revision:row.revision,next_status:status,...(comment!==undefined?{admin_comment:comment.trim()}:{} )}).abortSignal(AbortSignal.timeout(15000)).single();
 if(error)throw Error(error.message);return data as Feedback;
}
export async function exportFeedback(scope:FeedbackScope):Promise<FeedbackExport>{
 const {data,error}=await client().rpc('export_lesson_feedback',{export_scope:scope}).abortSignal(AbortSignal.timeout(60000));
 if(error)throw Error('Nie udało się pobrać pełnego eksportu. Plik nie został utworzony. Spróbuj ponownie.');
 if(data?.format!=='guitar-quest-feedback'||data.schemaVersion!==1||!Array.isArray(data.entries)||data.count!==data.entries.length||data.scope!==scope)throw Error('Niepełny lub nieprawidłowy eksport. Spróbuj ponownie.');
 return data as FeedbackExport;
}
export function downloadFeedback(data:FeedbackExport){
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}));
 const anchor=document.createElement('a');anchor.href=url;anchor.download=`guitar-quest-feedback-${data.scope}-${data.exportedAt.slice(0,10)}.json`;anchor.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
