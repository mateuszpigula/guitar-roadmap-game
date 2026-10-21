import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.startsWith('VITE_SUPABASE_')).map(l=>{const n=l.indexOf('=');return [l.slice(0,n),l.slice(n+1).replace(/^"|"$/g,'')];}));
const client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const read=await client.from('lesson_feedback').select('*');assert.ok(read.error||read.data.length===0,'Anonymous read must be denied');
for(const [name,args]of [
 ['submit_lesson_feedback',{request_id:'fda10000-0000-4000-8000-000000000099',target_lesson:'ch-01-1',program_version:2,feedback_category:'idea',feedback_body:'Denied anonymous test'}],
 ['review_lesson_feedback',{feedback_id:'fda10000-0000-4000-8000-000000000099',expected_revision:1,next_status:'planned'}],
 ['export_lesson_feedback',{export_scope:'mine'}],['export_lesson_feedback',{export_scope:'all'}]
]){const result=await client.rpc(name,args);assert.ok(result.error,`${name} must reject anonymous access`);assert.notEqual(result.error.code,'PGRST202','RPC must exist in production');}
console.log('PASS: feedback table and all RPCs exist; anonymous read, submit, review and both exports are denied.');
