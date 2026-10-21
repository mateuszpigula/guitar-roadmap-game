import {afterEach,describe,expect,it} from 'vitest';
import {IDBFactory} from 'fake-indexeddb';
import {bundledContent,installCatalog,lessons} from './catalog';
import {assertCompatible,parseCurriculum,parseRelease} from './model';
import type {Release} from './model';
import {contentCache,loadCatalog} from './repository';
import {freshState,parseBackup,progressFor,xp} from '../state';
import {mergeProgress} from '../sync';
const release=(version=2):Release=>({version,title:'Program testowy',published_at:'2026-10-21T12:00:00.000Z',content:structuredClone(bundledContent)});
afterEach(()=>installCatalog(release()));
describe('published curriculum',()=>{
 it('validates the complete original program',()=>expect(parseCurriculum(bundledContent).lessons).toHaveLength(200));
 it('rejects unsafe links, missing references, duplicate IDs and cycles',()=>{
  const c=structuredClone(bundledContent);c.sources.classical.url='javascript:alert(1)';expect(()=>parseCurriculum(c)).toThrow();
  c.sources.classical.url='https://example.com';c.lessons[0].prerequisites=['missing'];expect(()=>parseCurriculum(c)).toThrow('Nieistniejący');
  c.lessons[0].prerequisites=[c.lessons[0].id];expect(()=>parseCurriculum(c)).toThrow('Pętla');
  c.lessons[0].prerequisites=[];c.lessons.push(c.lessons[0]);expect(()=>parseCurriculum(c)).toThrow('Powtórzone');
 });
 it('preserves IDs, XP and song choices across publications',()=>{
  const c=structuredClone(bundledContent);c.lessons[0].title='Poprawiony tytuł';expect(()=>assertCompatible(bundledContent,c)).not.toThrow();
  c.lessons[0].challenge=true;expect(()=>assertCompatible(bundledContent,c)).toThrow('XP');c.lessons[0].challenge=false;
  c.lessons.find(l=>l.songChoices)!.songChoices!.pop();expect(()=>assertCompatible(bundledContent,c)).toThrow('wyboru');
 });
 it('stores and restores a checked release in IndexedDB',async()=>{const cache=contentCache(new IDBFactory());expect(await cache.read()).toBeNull();await cache.write(release(3));expect((await cache.read())?.version).toBe(3);});
 it('never lets a delayed older response replace a newer offline release',async()=>{const cache=contentCache(new IDBFactory());await cache.write(release(4));await cache.write(release(3));expect((await cache.read())?.version).toBe(4);});
 it('uses cached lessons offline instead of reverting to the bundle',async()=>{const cache=contentCache(new IDBFactory()),r=release(4);r.content.lessons[0].title='Lekcja z chmury';await cache.write(r);const status=await loadCatalog(cache,async()=>{throw new Error('offline');});expect(status.origin).toBe('cache');expect(status.version).toBe(4);expect(lessons[0].title).toBe('Lekcja z chmury');});
 it('does not overwrite a valid cached release with invalid remote content',async()=>{const cache=contentCache(new IDBFactory());await cache.write(release(3));const status=await loadCatalog(cache,async()=>parseRelease({...release(4),content:{}}));expect(status.version).toBe(3);expect((await cache.read())?.version).toBe(3);});
 it('opens the bundled program when both network and browser storage fail',async()=>{const result=await loadCatalog({read:async()=>{throw Error();},write:async()=>{throw Error();}},async()=>{throw Error();});expect(result.origin).toBe('bundle');expect(result.warning).toBeTruthy();});
 it('keeps new content usable while reporting an unavailable offline cache',async()=>{const result=await loadCatalog({read:async()=>null,write:async()=>{throw Error();}},async()=>release(3));expect(result.origin).toBe('cloud');expect(result.warning).toContain('offline');});
 it('preserves newer-device progress and selections on a device with older lessons',()=>{
  const old=freshState(),future=freshState();future.curriculumVersion=3;future.progress['future-lesson']={...progressFor(future,'future-lesson'),notes:'Notatka z drugiego urządzenia',selectedSongId:'future-song'};future.songs['future-song']={status:'practicing',bpm:75,notes:'Mój utwór'};
  const read=parseBackup(JSON.stringify(future));expect(read.curriculumVersion).toBe(3);expect(read.progress).toEqual(future.progress);
  const merged=mergeProgress(old,old,read).state;expect(merged.progress).toEqual(future.progress);expect(merged.songs).toEqual(future.songs);expect(merged.curriculumVersion).toBe(3);
 });
 it('keeps historical XP and notes after a content-only update',()=>{const s=freshState();s.progress['ch-01-1']={...progressFor(s,'ch-01-1'),status:'done',completedAt:'2026-10-21T12:00:00.000Z',due:'2026-10-22T12:00:00.000Z',notes:'Zachowaj mnie'};const r=release(3);r.content.lessons[0].title='Nowa nazwa';installCatalog(r);const restored=parseBackup(JSON.stringify(s));expect(restored.progress).toEqual(s.progress);expect(xp(restored)).toBe(10);});
});
