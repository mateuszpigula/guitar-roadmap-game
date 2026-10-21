import { describe, it, expect } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { freshState, isAvailable, parseBackup, plusDays, progressFor, review, setStatus, xp, dueLessons, nextLesson } from './state';
import { lessons, coreLessons, lessonById, sources, chapters } from './data/curriculum';
import { createRepository } from './storage';
import { songs } from './data/repertoire';
const start=new Date('2026-10-20T10:00:00.000Z');
describe('curriculum integrity',()=>{
 it('has 150 complete core lessons, 50 side quests and 20 meaningful challenges',()=>{
  expect(coreLessons).toHaveLength(150);expect(lessons.filter(l=>l.optional)).toHaveLength(50);expect(lessons.filter(l=>l.challenge)).toHaveLength(20);expect(new Set(lessons.map(l=>l.id)).size).toBe(200);
  for(const c of chapters){expect(coreLessons.filter(l=>l.chapter===c.id)).toHaveLength(15);}
  for(const l of lessons){expect(l.theory.trim().length).toBeGreaterThan(30);expect(l.steps.length).toBeGreaterThanOrEqual(3);expect(l.example.length).toBeGreaterThan(10);expect(l.criteria.length).toBeGreaterThan(0);expect(l.mistake.length).toBeGreaterThan(15);expect(sources[l.source]?.url).toMatch(/^https:\/\//);}
 });
 it('has an acyclic dependency graph with no missing lesson',()=>{
  const visiting=new Set<string>(),visited=new Set<string>();function visit(id:string){expect(lessonById[id]).toBeDefined();if(visited.has(id))return;expect(visiting.has(id),id).toBe(false);visiting.add(id);lessonById[id].prerequisites.forEach(visit);visiting.delete(id);visited.add(id);}
  lessons.forEach(l=>visit(l.id));expect(visited.size).toBe(200);
 });
 it('all repertoire skills and exercises exist',()=>{for(const song of songs){song.requirements.forEach(id=>expect(lessonById[id]).toBeDefined());if(song.lesson)expect(lessonById[song.lesson]).toBeDefined();}});
});
describe('progress and XP',()=>{
 it('opens the next task only after completion and never awards duplicate XP',()=>{let s=freshState();expect(nextLesson(s)?.id).toBe('ch-01-1');expect(isAvailable(s,lessonById['ch-01-2'])).toBe(false);s=setStatus(s,'ch-01-1','practicing',start);expect(xp(s)).toBe(0);s=setStatus(s,'ch-01-1','done',start);expect(xp(s)).toBe(10);expect(isAvailable(s,lessonById['ch-01-2'])).toBe(true);expect(setStatus(s,'ch-01-1','done',start)).toBe(s);expect(xp(setStatus(s,'ch-01-1','done',start))).toBe(10);});
 it('blocks direct completion of a locked task',()=>{expect(()=>setStatus(freshState(),'ch-10-8','done')).toThrow('odblokuj');});
 it('manual unlock does not complete prerequisites',()=>{let s=freshState();s.progress['ch-05-1']={...progressFor(s,'ch-05-1'),unlocked:true};expect(isAvailable(s,lessonById['ch-05-1'])).toBe(true);expect(xp(s)).toBe(0);s=setStatus(s,'ch-05-1','done',start);expect(xp(s)).toBe(10);expect(progressFor(s,'ch-04-8').status).toBe('todo');});
 it('subtracts reverted XP without destroying later history, and does not duplicate on redo',()=>{let s=setStatus(freshState(),'ch-01-1','done',start);s=setStatus(s,'ch-01-2','done',start);s=setStatus(s,'ch-01-1','practicing',start);expect(xp(s)).toBe(10);expect(progressFor(s,'ch-01-2').status).toBe('done');expect(progressFor(s,'ch-01-1').due).toBeUndefined();s=setStatus(s,'ch-01-1','done',start);expect(xp(s)).toBe(20);});
 it('earns 190 XP for a chapter including its repertoire scene, 240 with side quests',()=>{let s=freshState();coreLessons.filter(l=>l.chapter===1).forEach(l=>{if(l.songChoices){const id=l.songChoices[0];s.progress[l.id]={...progressFor(s,l.id),selectedSongId:id};s.songs[id]={status:'done',notes:'Wykonane w dwóch sesjach',bpm:60};}s=setStatus(s,l.id,'done',start);});expect(xp(s)).toBe(190);lessons.filter(l=>l.chapter===1&&l.optional).forEach(l=>{s=setStatus(s,l.id,'done',start);});expect(xp(s)).toBe(240);expect(nextLesson(s)?.chapter).toBe(2);});
});
describe('spaced review',()=>{
 it('schedules 1, 3, 7, 14 days and caps further intervals at 14',()=>{let s=setStatus(freshState(),'ch-01-1','done',start);expect(s.progress['ch-01-1'].due).toBe(plusDays(start,1));for(const n of [3,7,14,14]){s=review(s,'ch-01-1',true,start);expect(s.progress['ch-01-1'].due).toBe(plusDays(start,n));}expect(xp(s)).toBe(10);});
 it('resets hard items to tomorrow without erasing completion',()=>{let s=setStatus(freshState(),'ch-01-1','done',start);s=review(s,'ch-01-1',true,start);s=review(s,'ch-01-1',false,start);expect(s.progress['ch-01-1'].reviewStep).toBe(0);expect(s.progress['ch-01-1'].due).toBe(plusDays(start,1));expect(xp(s)).toBe(10);});
 it('preserves overdue items and excludes future and incomplete tasks',()=>{const s=setStatus(freshState(),'ch-01-1','done',start);expect(dueLessons(s,start)).toHaveLength(0);expect(dueLessons(s,new Date('2027-01-01T12:00:00Z')).map(l=>l.id)).toEqual(['ch-01-1']);expect(review(freshState(),'ch-01-1',true,start).progress).toEqual({});});
});
describe('backup import',()=>{
 it('roundtrips all user fields',()=>{const s=setStatus(freshState(),'ch-01-1','done',start);s.progress['ch-01-1'].notes='Pierwsza próba 🎸';s.progress['ch-01-1'].bpm=70;s.sessions=[{id:'2026-10-20',date:'2026-10-20',blocks:['prepare'],minutes:2}];s.songs['song-01']={status:'practicing',notes:'Wolniej',bpm:50};s.settings={reducedMotion:true,sessionMinutes:20};expect(parseBackup(JSON.stringify(s))).toEqual(s);});
 it.each(['broken','{}','null','[]','{"version":2}','{"version":1,"curriculumVersion":2}'])('rejects malformed/unsupported input: %s',text=>expect(()=>parseBackup(text)).toThrow());
 it('rejects malformed nested fields and unknown lessons',()=>{const s=freshState();s.progress.unknown=progressFor(s,'ch-01-1');expect(()=>parseBackup(JSON.stringify(s))).toThrow();delete s.progress.unknown;s.progress['ch-01-1']={...progressFor(s,'ch-01-1'),bpm:-5};expect(()=>parseBackup(JSON.stringify(s))).toThrow();s.progress['ch-01-1']={...progressFor(s,'ch-01-1'),bpm:60,status:'done'};expect(()=>parseBackup(JSON.stringify(s))).toThrow();});
 it('rejects duplicate session IDs and invalid review step',()=>{const s=freshState();s.sessions=[{id:'x',date:'2026-10-20',minutes:2,blocks:['prepare']},{id:'x',date:'2026-10-20',minutes:2,blocks:['prepare']}];expect(()=>parseBackup(JSON.stringify(s))).toThrow();s.sessions=[];s.progress['ch-01-1']={...progressFor(s,'ch-01-1'),reviewStep:99};expect(()=>parseBackup(JSON.stringify(s))).toThrow();});
 it('rejects prototype keys and unknown repertoire entries',()=>{const s=freshState();const input=JSON.stringify(s).replace('\"progress\":{}','\"progress\":{\"__proto__\":{\"status\":\"todo\",\"notes\":\"\",\"bpm\":60,\"unlocked\":false,\"reviewStep\":0}}');expect(()=>parseBackup(input)).toThrow();s.songs['song-99']={status:'todo',bpm:60,notes:''};expect(()=>parseBackup(JSON.stringify(s))).toThrow();});
 it('rejects nonexistent calendar days and mismatched session identity',()=>{const s=freshState();s.sessions=[{id:'2026-02-30',date:'2026-02-30',minutes:2,blocks:['prepare']}];expect(()=>parseBackup(JSON.stringify(s))).toThrow();s.sessions=[{id:'other',date:'2026-10-20',minutes:2,blocks:['prepare']}];expect(()=>parseBackup(JSON.stringify(s))).toThrow();});
 it('does not modify current state on a failed import',()=>{const s=setStatus(freshState(),'ch-01-1','done',start),before=JSON.stringify(s);try{parseBackup('{bad');}catch{}expect(JSON.stringify(s)).toBe(before);});
});
describe('IndexedDB repository',()=>{
 it('persists through separate repository instances',async()=>{const factory=new IDBFactory();const a=createRepository(factory);expect(await a.load()).toEqual(freshState());const s=setStatus(freshState(),'ch-01-1','done',start);await a.save(s);expect(await createRepository(factory).load()).toEqual(s);});
 it('surfaces unavailable storage instead of claiming a save succeeded',async()=>{const broken={open(){throw new Error('Storage blocked');}} as unknown as IDBFactory;await expect(createRepository(broken).save(freshState())).rejects.toThrow('Storage blocked');});
 it('retains valid data after rejected backup',async()=>{const repo=createRepository(new IDBFactory());const s=setStatus(freshState(),'ch-01-1','done',start);await repo.save(s);try{const invalid=parseBackup('{"version":4}');await repo.save(invalid);}catch{}expect(await repo.load()).toEqual(s);});
});
