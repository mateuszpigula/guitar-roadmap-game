import type { AppState, Progress, Status, Lesson } from './types';
import { lessons, coreLessons, lessonById, curriculumVersion } from './content/catalog';
import { songs } from './content/catalog';
export const freshState = (): AppState => ({version:1,curriculumVersion,progress:{},sessions:[],songs:{},settings:{reducedMotion:false,sessionMinutes:18}});
export const emptyProgress=():Progress=>({status:'todo',reviewStep:0,notes:'',bpm:60,unlocked:false});
export const progressFor=(s:AppState,id:string):Progress=>s.progress[id]??emptyProgress();
export const isAvailable=(s:AppState,l:Lesson)=>progressFor(s,l.id).unlocked||progressFor(s,l.id).status!=='todo'||l.prerequisites.every(id=>progressFor(s,id).status==='done');
export const nextLesson=(s:AppState)=>coreLessons.find(l=>progressFor(s,l.id).status!=='done'&&isAvailable(s,l))??coreLessons.find(l=>progressFor(s,l.id).status!=='done');
export const xp=(s:AppState)=>lessons.reduce((sum,l)=>sum+(progressFor(s,l.id).status==='done'?(l.challenge?30:10):0),0);
export function plusDays(now:Date,days:number){const d=new Date(now);d.setDate(d.getDate()+days);return d.toISOString();}
export function setStatus(s:AppState,id:string,status:Status,now=new Date()):AppState {
 if(!Object.hasOwn(lessonById,id))throw new Error('Nieznane zadanie.');
 const old=progressFor(s,id); if(old.status===status)return s;
 if(status!=='todo'&&!isAvailable(s,lessonById[id]))throw new Error('Najpierw odblokuj zadanie.');
 const l=lessonById[id];
 if(status==='done'&&l.songChoices&&(!old.selectedSongId||!l.songChoices.includes(old.selectedSongId)||s.songs[old.selectedSongId]?.status!=='done'))throw new Error('Wybierz utwór i potwierdź jego kryteria przed zaliczeniem sceny.');
 const next:Progress={...old,status};
 if(status==='done'){next.completedAt=now.toISOString();next.reviewStep=0;next.due=plusDays(now,1);}
 else {delete next.completedAt;delete next.due;next.reviewStep=0;}
 return {...s,progress:{...s.progress,[id]:next}};
}
export function review(s:AppState,id:string,easy:boolean,now=new Date()):AppState {
 const old=progressFor(s,id); if(old.status!=='done')return s;
 const step=easy?Math.min(old.reviewStep+1,3):0;
 return {...s,progress:{...s.progress,[id]:{...old,reviewStep:step,due:plusDays(now,[1,3,7,14][step])}}};
}
export const dueLessons=(s:AppState,now=new Date())=>lessons.filter(l=>{const p=progressFor(s,l.id);return p.status==='done'&&p.due&&Date.parse(p.due)<=now.getTime();}).sort((a,b)=>String(s.progress[a.id].due).localeCompare(String(s.progress[b.id].due)));
export function localDay(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
const object=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const validStatus=(v:unknown)=>v==='todo'||v==='practicing'||v==='done';
const validText=(v:unknown)=>typeof v==='string'&&v.length<=10000;
const validBpm=(v:unknown)=>typeof v==='number'&&Number.isInteger(v)&&v>=30&&v<=240;
const validDate=(v:unknown)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString()===v;
export function parseBackup(input:string):AppState {
 if(input.length>5_000_000)throw new Error('Plik jest zbyt duży (maks. 5 MB).');
 let v:unknown;try{v=JSON.parse(input);}catch{throw new Error('To nie jest poprawny plik JSON.');}
 if(!object(v)||v.version!==1||(!Number.isSafeInteger(v.curriculumVersion)||Number(v.curriculumVersion)<1))throw new Error('Nieobsługiwana wersja kopii Guitar Quest.');
 if(!object(v.progress)||!object(v.songs)||!Array.isArray(v.sessions)||!object(v.settings))throw new Error('Kopia nie zawiera kompletnego postępu.');
 if(typeof v.settings.reducedMotion!=='boolean'||![15,18,20].includes(Number(v.settings.sessionMinutes))||typeof v.settings.sessionMinutes!=='number')throw new Error('Nieprawidłowe ustawienia sesji.');
 const newer=Number(v.curriculumVersion)>curriculumVersion;
 const validId=(id:string)=>/^[a-z][a-z0-9-]{0,79}$/.test(id)&&!['constructor','prototype'].includes(id);
 const out=freshState();out.curriculumVersion=Math.max(curriculumVersion,Number(v.curriculumVersion));out.settings={reducedMotion:v.settings.reducedMotion,sessionMinutes:v.settings.sessionMinutes as 15|18|20};
 for(const [id,p] of Object.entries(v.progress)){
  if((!Object.hasOwn(lessonById,id)&&!newer)||!validId(id)||!object(p)||!validStatus(p.status)||!validText(p.notes)||!validBpm(p.bpm)||typeof p.unlocked!=='boolean'||!Number.isInteger(p.reviewStep)||Number(p.reviewStep)<0||Number(p.reviewStep)>3)throw new Error('Nieprawidłowe dane zadania.');
  if((p.status==='done'&&(!validDate(p.completedAt)||!validDate(p.due)))||(p.status!=='done'&&(p.completedAt!==undefined||p.due!==undefined)))throw new Error('Nieprawidłowe terminy powtórek.');
  if(p.selectedSongId!==undefined&&(typeof p.selectedSongId!=='string'||!validId(p.selectedSongId)||(!newer&&!lessonById[id]?.songChoices?.includes(p.selectedSongId))))throw new Error('Nieprawidłowy wybór utworu.');
  if(lessonById[id]?.songChoices&&p.status==='done'&&!p.selectedSongId)throw new Error('Zaliczona scena nie ma wybranego utworu.');
  out.progress[id]={...(p.selectedSongId?{selectedSongId:p.selectedSongId as string}:{}),status:p.status as Status,notes:p.notes as string,bpm:p.bpm as number,unlocked:p.unlocked,reviewStep:p.reviewStep as number,...(p.status==='done'?{completedAt:p.completedAt as string,due:p.due as string}:{})};
 }
 for(const [id,p] of Object.entries(v.songs)){
  if((!songs.some(song=>song.id===id)&&!newer)||!validId(id)||!object(p)||!validStatus(p.status)||!validText(p.notes)||!validBpm(p.bpm))throw new Error('Nieprawidłowy repertuar.');
  out.songs[id]={status:p.status as Status,notes:p.notes as string,bpm:p.bpm as number};
 }
 const ids=new Set<string>();
 for(const session of v.sessions){
  if(!object(session)||typeof session.id!=='string'||session.id.length>100||ids.has(session.id)||typeof session.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(session.date)||!validDate(session.date+'T12:00:00.000Z')||session.id!==session.date||!Array.isArray(session.blocks)||!session.blocks.every(b=>['prepare','review','learn','play'].includes(b))||new Set(session.blocks).size!==session.blocks.length||typeof session.minutes!=='number'||!Number.isFinite(session.minutes)||session.minutes<0||session.minutes>20)throw new Error('Nieprawidłowa historia sesji.');
  ids.add(session.id);out.sessions.push({id:session.id,date:session.date,minutes:session.minutes,blocks:session.blocks as string[]});
 }
 return out;
}
