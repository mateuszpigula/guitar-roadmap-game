import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.startsWith('VITE_SUPABASE_')).map(l=>{const n=l.indexOf('=');return [l.slice(0,n),l.slice(n+1).replace(/^"|"$/g,'')];}));
const client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const {data,error}=await client.from('curriculum_releases').select('version,title,published_at,content').order('version',{ascending:false}).limit(1).single();assert.equal(error,null);assert.ok(data.content.lessons.length>=200);assert.ok(data.content.songs.length>=39);
const draft=await client.from('curriculum_draft').select('*');assert.ok(draft.error||draft.data.length===0);
for(const [name,args]of [['start_curriculum_draft',{}],['save_curriculum_draft',{expected_revision:1,next_title:'Denied anonymous test',next_content:{}}],['publish_curriculum_draft',{expected_revision:1}]]){const r=await client.rpc(name,args);assert.ok(r.error,`${name} must reject anonymous calls`);}
const role=await client.from('curriculum_editors').insert({user_id:'00000000-0000-4000-8000-000000000099'});assert.ok(role.error,'Self-escalation must be rejected');
console.log(`PASS: public release v${data.version}, ${data.content.lessons.length} lessons, ${data.content.songs.length} songs; draft access, editor role assignment and all mutation RPCs denied to anonymous client.`);
