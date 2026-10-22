import {beforeEach,describe,expect,it,vi} from 'vitest';
import {bundledContent} from './catalog';
import {startDraft,saveDraft,publishDraft} from './admin';
import type {Draft} from './model';
const {fetcher}=vi.hoisted(()=>({fetcher:vi.fn()}));
vi.mock('../cloud',async()=>{const {createClient}=await import('@supabase/supabase-js');return {cloud:createClient('https://test.invalid','public-test-key',{global:{fetch:fetcher},auth:{persistSession:false,autoRefreshToken:false}})};});
const draft:Draft={id:1,base_version:2,revision:1,title:'Szkic',content:bundledContent,updated_at:'2026-10-21T12:00:00Z'};
beforeEach(()=>{fetcher.mockReset();});
describe('Supabase editor transport',()=>{
 it('requests a single composite row from start/save RPCs',async()=>{
  fetcher.mockImplementation(async(_url:string,options:RequestInit)=>{const single=new Headers(options.headers).get('Accept')==='application/vnd.pgrst.object+json';return new Response(JSON.stringify(single?draft:[draft]),{status:200,headers:{'Content-Type':'application/json'}});});
  expect((await startDraft()).content.lessons).toHaveLength(200);
  expect((await saveDraft(draft,bundledContent,'Nowy szkic')).id).toBe(1);
  const payload=JSON.parse(fetcher.mock.calls[1][1].body);expect(payload.expected_revision).toBe(1);expect(payload.next_title).toBe('Nowy szkic');
 });
 it('keeps revision conflicts visible to the editor instead of reporting a save',async()=>{fetcher.mockResolvedValue(new Response(JSON.stringify({message:'Wersja robocza zmieniła się.',code:'40001'}),{status:409,headers:{'Content-Type':'application/json'}}));await expect(saveDraft(draft,bundledContent,'Szkic')).rejects.toThrow('zmieniła');});
 it('reads a scalar publication version',async()=>{fetcher.mockResolvedValue(new Response('3',{status:200,headers:{'Content-Type':'application/json'}}));expect(await publishDraft(2)).toBe(3);});
});
