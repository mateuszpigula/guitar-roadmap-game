import {afterEach,describe,expect,it} from 'vitest';
import {IDBFactory} from 'fake-indexeddb';
import {bundledContent,bundledVersion,installCatalog,lessons} from './catalog';
import {assertCompatible,parseCurriculum,parseRelease} from './model';
import type {Release} from './model';
import {contentCache,loadCatalog} from './repository';
import {freshState,parseBackup,progressFor,xp} from '../state';
import {mergeProgress} from '../sync';
const release=(version=bundledVersion):Release=>({version,title:'Program testowy',published_at:'2026-10-21T12:00:00.000Z',content:structuredClone(bundledContent)});
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
 it('stores and restores a checked release in IndexedDB',async()=>{const cache=contentCache(new IDBFactory());expect(await cache.read()).toBeNull();await cache.write(release(bundledVersion));expect((await cache.read())?.version).toBe(bundledVersion);});
 it('never lets a delayed older response replace a newer offline release',async()=>{const cache=contentCache(new IDBFactory());await cache.write(release(bundledVersion+1));await cache.write(release(bundledVersion));expect((await cache.read())?.version).toBe(bundledVersion+1);});
 it('uses cached lessons offline instead of reverting to the bundle',async()=>{const cache=contentCache(new IDBFactory()),r=release(bundledVersion+1);r.content.lessons[0].title='Lekcja z chmury';await cache.write(r);const status=await loadCatalog(cache,async()=>{throw new Error('offline');});expect(status.origin).toBe('cache');expect(status.version).toBe(bundledVersion+1);expect(lessons[0].title).toBe('Lekcja z chmury');});
 it('does not overwrite a valid cached release with invalid remote content',async()=>{const cache=contentCache(new IDBFactory());await cache.write(release(bundledVersion));const status=await loadCatalog(cache,async()=>parseRelease({...release(bundledVersion+1),content:{}}));expect(status.version).toBe(bundledVersion);expect((await cache.read())?.version).toBe(bundledVersion);});
 it('opens the bundled program when both network and browser storage fail',async()=>{const result=await loadCatalog({read:async()=>{throw Error();},write:async()=>{throw Error();}},async()=>{throw Error();});expect(result.origin).toBe('bundle');expect(result.warning).toBeTruthy();});
 it('keeps new content usable while reporting an unavailable offline cache',async()=>{const result=await loadCatalog({read:async()=>null,write:async()=>{throw Error();}},async()=>release(bundledVersion));expect(result.origin).toBe('cloud');expect(result.warning).toContain('offline');});
 it('uses corrected bundled lessons when an older offline cache exists',async()=>{const cache=contentCache(new IDBFactory()),old=release(2);old.content.lessons.find(l=>l.id==='ch-01-7')!.example='Stary przykład bez diagramu';await cache.write(old);const result=await loadCatalog(cache,async()=>{throw Error('offline');});expect(result.origin).toBe('bundle');expect(result.version).toBe(bundledVersion);expect(lessons.find(l=>l.id==='ch-01-7')!.example).toContain('X02210');});
 it('does not downgrade the bundled curriculum from an older server response',async()=>{const cache=contentCache(new IDBFactory()),old=release(2);old.content.lessons[0].title='Stara treść';const result=await loadCatalog(cache,async()=>old);expect(result.origin).toBe('bundle');expect(result.version).toBe(bundledVersion);expect(lessons[0].title).toBe(bundledContent.lessons[0].title);expect(await cache.read()).toBeNull();});
 it('preserves newer-device progress and selections on a device with older lessons',()=>{
  const old=freshState(),future=freshState();future.curriculumVersion=bundledVersion+1;future.progress['future-lesson']={...progressFor(future,'future-lesson'),notes:'Notatka z drugiego urządzenia',selectedSongId:'future-song'};future.songs['future-song']={status:'practicing',bpm:75,notes:'Mój utwór'};
  const read=parseBackup(JSON.stringify(future));expect(read.curriculumVersion).toBe(bundledVersion+1);expect(read.progress).toEqual(future.progress);
  const merged=mergeProgress(old,old,read).state;expect(merged.progress).toEqual(future.progress);expect(merged.songs).toEqual(future.songs);expect(merged.curriculumVersion).toBe(bundledVersion+1);
 });
 it('keeps historical XP and notes after a content-only update',()=>{const s=freshState();s.progress['ch-01-1']={...progressFor(s,'ch-01-1'),status:'done',completedAt:'2026-10-21T12:00:00.000Z',due:'2026-10-22T12:00:00.000Z',notes:'Zachowaj mnie'};const r=release(bundledVersion);r.content.lessons[0].title='Nowa nazwa';installCatalog(r);const restored=parseBackup(JSON.stringify(s));expect(restored.progress).toEqual(s.progress);expect(xp(restored)).toBe(10);});
});

it('never sends a lesson to a general Classical Guitar index',()=>{
 for(const lesson of bundledContent.lessons){const url=new URL(bundledContent.sources[lesson.source].url);if(url.hostname==='www.thisisclassicalguitar.com')expect(['/','/lessons/','/curriculum/']).not.toContain(url.pathname);}
});
