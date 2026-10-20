import {execFileSync} from 'node:child_process';
import {writeFileSync,readFileSync,unlinkSync,mkdirSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
const ref='wlgixxrgkmzopwsacffq',url=`https://${ref}.supabase.co`,file='output/.cloud-test-users.json';
const raw=JSON.parse(execFileSync('npx',['--no-install','supabase','projects','api-keys','--project-ref',ref,'--output','json'],{encoding:'utf8'}));
const keys=Array.isArray(raw)?raw:raw.api_keys??raw.keys;
const service=keys.find(k=>k.name==='service_role')?.api_key,publicKey=keys.find(k=>k.type==='publishable'||k.name==='anon')?.api_key;
if(!service||!publicKey)throw new Error('Required keys unavailable');
const options={auth:{persistSession:false,autoRefreshToken:false}},admin=createClient(url,service,options);
if(process.argv.includes('--cleanup')){
 for(const u of JSON.parse(readFileSync(file,'utf8'))){const {error}=await admin.auth.admin.deleteUser(u.id);if(error)throw new Error('Test account cleanup failed');}
 unlinkSync(file);console.log('Temporary verification accounts and their data removed.');process.exit(0);
}
const users=[];mkdirSync('output',{recursive:true});
for(let i=0;i<2;i++){
 const email=`guitar-quest-test-${Date.now()}-${i}@example.com`,password=randomBytes(24).toString('base64url');
 const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true});if(error)throw new Error(error.message);
 users.push({email,password,id:data.user.id});writeFileSync(file,JSON.stringify(users),{mode:0o600});
}
const [a,b]=users.map(()=>createClient(url,publicKey,options));
for(const [i,client]of [a,b].entries()){const {error}=await client.auth.signInWithPassword({email:users[i].email,password:users[i].password});assert.equal(error,null);}
const state={version:1,curriculumVersion:1,progress:{},songs:{},sessions:[],settings:{reducedMotion:false,sessionMinutes:18}};
let result=await a.rpc('save_guitar_progress',{expected_revision:0,next_state:state});assert.equal(result.error,null);assert.equal(result.data,true);
result=await a.rpc('save_guitar_progress',{expected_revision:0,next_state:state});assert.equal(result.data,false,'stale insert must fail');
const own=await a.from('guitar_progress').select('user_id,revision');assert.equal(own.data.length,1);assert.equal(own.data[0].user_id,users[0].id);
const other=await b.from('guitar_progress').select('user_id').eq('user_id',users[0].id);assert.deepEqual(other.data,[]);
const forbidden=await b.from('guitar_progress').insert({user_id:users[0].id,state,revision:1});assert.ok(forbidden.error);
const anon=createClient(url,publicKey,options);const anonRead=await anon.from('guitar_progress').select('user_id');assert.ok(anonRead.error||anonRead.data.length===0);
const anonWrite=await anon.rpc('save_guitar_progress',{expected_revision:0,next_state:state});assert.ok(anonWrite.error);
const wins=await Promise.all([a.rpc('save_guitar_progress',{expected_revision:1,next_state:state}),a.rpc('save_guitar_progress',{expected_revision:1,next_state:state})]);assert.equal(wins.filter(v=>v.data===true).length,1);
console.log('PASS: password login, own data, cross-account read/write isolation, anonymous denial, stale and concurrent writes. Browser accounts ready.');
