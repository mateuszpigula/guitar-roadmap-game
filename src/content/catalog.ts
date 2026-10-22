import {chapters as seedChapters,lessons as seedLessons,sources as seedSources,curriculumVersion as seedVersion} from '../data/curriculum';
import {songs as seedSongs} from '../data/repertoire';
import type {Curriculum, Release} from './model';
export const bundledContent:Curriculum={schemaVersion:1,chapters:seedChapters,lessons:seedLessons,songs:seedSongs,sources:seedSources};
// A catalog is installed once, before progress is loaded. A newer release is adopted on reload,
// never halfway through a lesson or while another tab is editing a draft.
export const bundledVersion=seedVersion;
export let curriculumVersion=bundledVersion;
export let chapters=seedChapters;
export let lessons=seedLessons;
export let sources=seedSources;
export let songs=seedSongs;
export let coreLessons=lessons.filter(l=>!l.optional);
export let lessonById=Object.fromEntries(lessons.map(l=>[l.id,l]));
export let songById=Object.fromEntries(songs.map(s=>[s.id,s]));
export function installCatalog(release:Release){
 curriculumVersion=release.version;
 chapters=release.content.chapters;
 lessons=[...release.content.lessons].sort((a,b)=>a.chapter-b.chapter||Number(a.optional)-Number(b.optional)||a.order-b.order);
 sources=release.content.sources;songs=release.content.songs;
 coreLessons=lessons.filter(l=>!l.optional);lessonById=Object.fromEntries(lessons.map(l=>[l.id,l]));songById=Object.fromEntries(songs.map(s=>[s.id,s]));
}
