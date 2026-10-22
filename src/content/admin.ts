import {cloud} from '../cloud';
import type {Curriculum,Draft,Release} from './model';
import {parseDraft,parseRelease} from './model';
const client=()=>{if(!cloud)throw new Error('Brak połączenia z Supabase.');return cloud;};
export async function isEditor(){const {data,error}=await client().rpc('is_curriculum_editor').abortSignal(AbortSignal.timeout(8000));if(error)throw new Error('Nie można sprawdzić uprawnień edytora.');return data===true;}
export async function readEditor(){
 const c=client();
 const [r,d]=await Promise.all([c.from('curriculum_releases').select('version,title,published_at,content').order('version',{ascending:false}).limit(1).abortSignal(AbortSignal.timeout(10000)).single(),c.from('curriculum_draft').select('*').eq('id',1).abortSignal(AbortSignal.timeout(10000)).maybeSingle()]);
 if(r.error||d.error)throw new Error('Nie udało się pobrać programu. Sprawdź połączenie i spróbuj ponownie.');
 return {published:parseRelease(r.data),draft:d.data?parseDraft(d.data):null};
}
export async function releaseHistory(){const {data,error}=await client().from('curriculum_releases').select('version,title,published_at').order('version',{ascending:false}).limit(20).abortSignal(AbortSignal.timeout(10000));if(error)throw new Error('Nie można odczytać historii.');return data as Omit<Release,'content'>[];}
export async function startDraft(){const {data,error}=await client().rpc('start_curriculum_draft').abortSignal(AbortSignal.timeout(10000)).single();if(error)throw new Error(error.message);return parseDraft(data);}
export async function saveDraft(d:Draft,content:Curriculum,title:string){const {data,error}=await client().rpc('save_curriculum_draft',{expected_revision:d.revision,next_content:content,next_title:title}).abortSignal(AbortSignal.timeout(10000)).single();if(error)throw new Error(error.message);return parseDraft(data);}
export async function publishDraft(revision:number){const {data,error}=await client().rpc('publish_curriculum_draft',{expected_revision:revision}).abortSignal(AbortSignal.timeout(10000));if(error)throw new Error(error.message);return data as number;}
