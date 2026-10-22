import { describe, it, expect } from 'vitest';
import { coreLessons, lessons, lessonById, bundledVersion } from './content/catalog';
import { songs, songById } from './content/catalog';
import { freshState, progressFor, setStatus, parseBackup, isAvailable, nextLesson, xp } from './state';
import { mergeProgress } from './sync';
const now=new Date('2026-10-21T12:00:00.000Z');
function readyScene(id='rep-01'){
 const s=freshState(),songId=lessonById[id].songChoices![0];
 s.progress[id]={...progressFor(s,id),unlocked:true,selectedSongId:songId};
 s.songs[songId]={status:'done',bpm:60,notes:'Próba w drugim dniu'};
 return s;
}
describe('expanded learning path',()=>{
 it('retains every legacy lesson ID and its XP weight',()=>{
  for(let c=1;c<=10;c++)for(let n=1;n<=8;n++){const l=lessonById[`ch-${String(c).padStart(2,'0')}-${n}`];expect(l).toBeDefined();expect(l.challenge).toBe(n===8);}
  for(let c=1;c<=10;c++)for(let n=1;n<=2;n++)expect(lessonById[`side-${String(c).padStart(2,'0')}-${n}`].optional).toBe(true);
 });
 it('can traverse the entire main path in order with one song per scene',()=>{
  let s=freshState();
  for(const l of coreLessons){expect(nextLesson(s)?.id).toBe(l.id);expect(isAvailable(s,l)).toBe(true);if(l.songChoices){const id=l.songChoices[0];s.progress[l.id]={...progressFor(s,l.id),selectedSongId:id};s.songs[id]={status:'done',bpm:60,notes:''};}s=setStatus(s,l.id,'done',now);}
  expect(nextLesson(s)).toBeUndefined();expect(xp(s)).toBe(1900);expect(Object.keys(s.songs)).toHaveLength(10);
 });
 it('every scene offers 3–5 complete, level-specific video assignments',()=>{
  const scenes=lessons.filter(l=>l.songChoices);expect(scenes).toHaveLength(10);
  for(const l of scenes){expect(l.songChoices!.length).toBeGreaterThanOrEqual(3);expect(l.songChoices!.length).toBeLessThanOrEqual(5);for(const id of l.songChoices!){const song=songById[id];expect(song.checkpoint).toBe(l.chapter);expect(song.url).toMatch(/^https:\/\/www.youtube.com\/watch\?v=[\w-]{11}$/);expect(song.practice).toHaveLength(3);expect(song.criteria!.length).toBeGreaterThanOrEqual(2);expect(song.nylon!.length).toBeGreaterThan(30);}}
  expect(new Set(songs.map(s=>s.id)).size).toBe(songs.length);
 });
 it('blocks a scene without a selected and completed eligible song, including manual unlock',()=>{
  const s=readyScene();delete s.progress['rep-01'].selectedSongId;
  expect(()=>setStatus(s,'rep-01','done',now)).toThrow('Wybierz');
  s.progress['rep-01'].selectedSongId='song-04';s.songs['song-04']={status:'done',bpm:60,notes:''};
  expect(()=>setStatus(s,'rep-01','done',now)).toThrow('Wybierz');
  s.progress['rep-01'].selectedSongId='rep-ode-melody';s.songs['rep-ode-melody'].status='practicing';
  expect(()=>setStatus(s,'rep-01','done',now)).toThrow('Wybierz');
 });
 it('completes one choice, unlocks the next chapter, and preserves later history on undo',()=>{
  let s=setStatus(readyScene(),'rep-01','done',now);expect(xp(s)).toBe(30);expect(isAvailable(s,lessonById['ch-02-1'])).toBe(true);expect(setStatus(s,'rep-01','done',now)).toBe(s);
  s=setStatus(s,'ch-02-1','done',now);s=setStatus(s,'rep-01','practicing',now);
  expect(xp(s)).toBe(10);expect(s.progress['ch-02-1'].status).toBe('done');expect(s.progress['rep-01'].selectedSongId).toBe('rep-ode-melody');
 });
 it('upgrades a v1 backup preserving all user history, without granting new lessons',()=>{
  const s=freshState();s.curriculumVersion=1;s.progress['ch-10-8']={...progressFor(s,'ch-10-8'),status:'done',completedAt:now.toISOString(),due:'2026-10-22T12:00:00.000Z',notes:'Mój stary występ',bpm:83};s.songs['song-04']={status:'practicing',notes:'Moja wersja',bpm:72};
  const upgraded=parseBackup(JSON.stringify(s));expect(upgraded.curriculumVersion).toBe(bundledVersion);expect(upgraded.progress).toEqual(s.progress);expect(upgraded.songs).toEqual(s.songs);expect(xp(upgraded)).toBe(30);expect(upgraded.progress['rep-10']).toBeUndefined();
 });
 it('roundtrips a completed choice and rejects invalid selection without touching current state',()=>{
  const s=setStatus(readyScene(),'rep-01','done',now),before=JSON.stringify(s);expect(parseBackup(before)).toEqual(s);
  const broken=JSON.parse(before);broken.progress['rep-01'].selectedSongId='rep-bourree';expect(()=>parseBackup(JSON.stringify(broken))).toThrow('wybór');expect(JSON.stringify(s)).toBe(before);
  delete broken.progress['rep-01'].selectedSongId;expect(()=>parseBackup(JSON.stringify(broken))).toThrow('wybranego');
 });
 it('syncs selected song together with completion, and independently merges song notes',()=>{
  const base=readyScene(),local=setStatus(base,'rep-01','done',now),remote=structuredClone(base);remote.songs['rep-ode-melody'].notes='Notatka z telefonu';
  const result=mergeProgress(base,local,remote);expect(result.conflicts).toEqual([]);expect(result.state.progress['rep-01'].status).toBe('done');expect(result.state.progress['rep-01'].selectedSongId).toBe('rep-ode-melody');expect(result.state.songs['rep-ode-melody'].notes).toBe('Notatka z telefonu');
 });
 it('does not silently attach completion to another device’s song choice',()=>{
  const base=readyScene(),local=setStatus(base,'rep-01','done',now),remote=structuredClone(base);remote.progress['rep-01'].selectedSongId='rep-seven';
  const merged=mergeProgress(base,local,remote);expect(merged.conflicts).toContain('progress.rep-01.status');expect(merged.state.progress['rep-01'].selectedSongId).toBe('rep-ode-melody');
  const preferred=mergeProgress(base,local,remote,'remote');expect(preferred.state.progress['rep-01'].status).toBe('todo');expect(preferred.state.progress['rep-01'].selectedSongId).toBe('rep-seven');
 });
});
