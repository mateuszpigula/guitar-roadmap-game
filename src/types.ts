export type Category = 'Technika' | 'Rytm' | 'Teoria' | 'Słuch' | 'Repertuar' | 'Improwizacja';
export interface Lesson { id: string; chapter: number; order: number; title: string; category: Category; theory: string; steps: string[]; example: string; criteria: string[]; mistake: string; source: string; prerequisites: string[]; optional: boolean; challenge: boolean; minutes: number; sessions?: [number,number]; branch?: string; songChoices?: string[] }
export interface Chapter { id: number; title: string; subtitle: string; region: string; }
export type Status = 'todo' | 'practicing' | 'done';
export interface Progress { status: Status; completedAt?: string; reviewStep: number; due?: string; notes: string; bpm: number; unlocked: boolean; selectedSongId?: string; }
export interface Session { id: string; date: string; minutes: number; blocks: string[]; }
export interface SongProgress { status: Status; bpm: number; notes: string; }
export interface AppState { version: 1; curriculumVersion: number; progress: Record<string, Progress>; sessions: Session[]; songs: Record<string, SongProgress>; settings: { reducedMotion: boolean; sessionMinutes: 15 | 18 | 20 }; }
export interface Song { id:string; title:string; artist:string; kind:'Piosenka'|'Riff'|'Aranżacja'; chapter:number; version:string; requirements:string[]; example:string; url?:string; lesson?:string; teacher?:string; language?:string; practice?:string[]; criteria?:string[]; nylon?:string; sessions?:[number,number]; checkpoint?:number; extraUrl?:string; }
