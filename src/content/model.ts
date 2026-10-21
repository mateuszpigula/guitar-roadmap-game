import Ajv from 'ajv';
import schema from './schema.json';
import draftSchema from './draft-schema.json';
import type {Chapter, Lesson, Song} from '../types';
export interface Source {title:string;url:string;language:string;access:string}
export interface Curriculum {schemaVersion:1;chapters:Chapter[];lessons:Lesson[];songs:Song[];sources:Record<string,Source>}
export interface Release {version:number;title:string;published_at:string;content:Curriculum}
export interface Draft {id:number;base_version:number;revision:number;title:string;content:Curriculum;updated_at:string}
const validate=new Ajv({allErrors:true,strict:false}).compile<Curriculum>(schema);
const validateDraft=new Ajv({allErrors:true,strict:false}).compile<Curriculum>(draftSchema);
export function parseDraftContent(value:unknown):Curriculum {if(!validateDraft(value))throw new Error('Nieprawidłowy format szkicu programu. Pobierz kopię i sprawdź jego strukturę.');return structuredClone(value);}
export function parseCurriculum(value:unknown):Curriculum {
 if(!validate(value))throw new Error(`Niekompletny program: ${validate.errors?.slice(0,3).map(e=>`${e.instancePath || 'program'} ${e.message}`).join('; ')}`);
 const c=value;
 function unique(ids:(string|number)[],label:string){if(new Set(ids).size!==ids.length)throw new Error(`Powtórzone identyfikatory: ${label}.`);}
 unique(c.lessons.map(l=>l.id),'zadania');unique(c.songs.map(s=>s.id),'utwory');unique(c.chapters.map(s=>s.id),'rozdziały');
 if(c.chapters.some((ch,i)=>ch.id!==i+1))throw new Error('Rozdziały muszą mieć kolejne numery od 1.');
 const chapters=new Set(c.chapters.map(ch=>ch.id)),lessons=new Map(c.lessons.map(l=>[l.id,l])),songs=new Map(c.songs.map(s=>[s.id,s]));
 for(const l of c.lessons){
  if(!chapters.has(l.chapter)||!Object.hasOwn(c.sources,l.source)||l.prerequisites.some(id=>!lessons.has(id)))throw new Error(`Nieistniejący rozdział, źródło lub wymaganie: ${l.title}.`);
  if(l.sessions&&l.sessions[0]>l.sessions[1])throw new Error(`Odwrócony zakres sesji: ${l.title}.`);
  if(l.songChoices&&(!l.challenge||l.songChoices.some(id=>{const s=songs.get(id);return !s||!s.url||!s.practice?.length||!s.criteria?.length||s.checkpoint!==l.chapter;})))throw new Error(`Scena wymaga utworów z filmem, ćwiczeniami i kryteriami z tego rozdziału: ${l.title}.`);
 }
 for(const s of c.songs){
  if(!chapters.has(s.chapter)||s.requirements.some(id=>!lessons.has(id))||(s.lesson&&!lessons.has(s.lesson))||(s.checkpoint!==undefined&&!chapters.has(s.checkpoint)))throw new Error(`Nieistniejące wymaganie lub rozdział utworu: ${s.title}.`);
  if(s.sessions&&s.sessions[0]>s.sessions[1])throw new Error(`Odwrócony zakres sesji: ${s.title}.`);
 }
 const done=new Set<string>(),active=new Set<string>();
 function visit(id:string){if(active.has(id))throw new Error(`Pętla wymagań przy zadaniu ${id}.`);if(done.has(id))return;active.add(id);lessons.get(id)!.prerequisites.forEach(visit);active.delete(id);done.add(id);}
 c.lessons.forEach(l=>visit(l.id));
 for(const ch of c.chapters){const core=c.lessons.filter(l=>l.chapter===ch.id&&!l.optional);if(!core.length)throw new Error(`Rozdział ${ch.id} nie ma zadań głównych.`);unique(core.map(l=>l.order),`kolejność rozdziału ${ch.id}`);}
 return structuredClone(c);
}
/** Published IDs, XP weights and previous song choices are permanent. Edits preserve history. */
export function assertCompatible(before:Curriculum,after:Curriculum){
 for(const ch of before.chapters)if(!after.chapters.some(c=>c.id===ch.id))throw new Error('Nie można usunąć opublikowanego rozdziału.');
 for(const l of before.lessons){const next=after.lessons.find(n=>n.id===l.id);if(!next)throw new Error(`Nie można usunąć opublikowanego zadania ${l.id}.`);if(next.challenge!==l.challenge||next.optional!==l.optional||next.chapter!==l.chapter)throw new Error(`Zachowaj rozdział, rodzaj i wartość XP zadania ${l.id}.`);if(l.songChoices?.some(id=>!next.songChoices?.includes(id))||(!l.songChoices&&next.songChoices))throw new Error(`Zachowaj historyczne kryteria wyboru utworu: ${l.id}.`);}
 for(const s of before.songs)if(!after.songs.some(n=>n.id===s.id))throw new Error(`Nie można usunąć opublikowanego utworu ${s.id}.`);
}
export function parseDraft(value:unknown):Draft {
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Serwer zwrócił nieprawidłowy szkic. Pobierz go ponownie.');
 const d=value as Draft;
 if(d.id!==1||!Number.isSafeInteger(d.base_version)||d.base_version<2||!Number.isSafeInteger(d.revision)||d.revision<1||typeof d.title!=='string'||typeof d.updated_at!=='string'||!Number.isFinite(Date.parse(d.updated_at)))throw new Error('Nieprawidłowa rewizja szkicu.');
 return {id:1,base_version:d.base_version,revision:d.revision,title:d.title,updated_at:d.updated_at,content:parseDraftContent(d.content)};
}
export function parseRelease(value:unknown):Release {
 if(!value||typeof value!=='object')throw new Error('Brak wersji programu.');
 const r=value as Release;
 if(!Number.isSafeInteger(r.version)||r.version<2||typeof r.title!=='string'||!r.title.trim()||typeof r.published_at!=='string'||!Number.isFinite(Date.parse(r.published_at)))throw new Error('Nieprawidłowa wersja programu.');
 return {...r,content:parseCurriculum(r.content)};
}
export function contentChanges(before:Curriculum,after:Curriculum){
 return (['chapters','lessons','songs','sources'] as const).map(kind=>{
  const rows=(c:Curriculum)=>kind==='sources'?Object.entries(c.sources).map(([id,v])=>({id,...v})):c[kind];
  const old=rows(before),next=rows(after);
  const added=next.filter(n=>!old.some(o=>o.id===n.id)).length;
  const changed=next.filter(n=>{const o=old.find(o=>o.id===n.id);return o&&JSON.stringify(o)!==JSON.stringify(n);}).length;
  return {kind,added,changed};
 });
}
