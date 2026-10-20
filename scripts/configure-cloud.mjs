// Use the CLI's authenticated session; never print credentials.
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const ref='wlgixxrgkmzopwsacffq';
const result=JSON.parse(execFileSync('npx',['--no-install','supabase','projects','api-keys','--project-ref',ref,'--output','json'],{encoding:'utf8'}));
const keys=Array.isArray(result)?result:result.api_keys??result.keys;
if(!Array.isArray(keys))throw new Error('Unexpected API key response');
const key=keys.find(k=>k.type==='publishable'||k.name==='anon');
if(!key?.api_key)throw new Error('Missing public API key');
const values={VITE_SUPABASE_URL:`https://${ref}.supabase.co`,VITE_SUPABASE_PUBLISHABLE_KEY:key.api_key};
writeFileSync('.env.local',Object.entries(values).map(([k,v])=>`${k}=${v}\n`).join(''),{mode:0o600});
if(process.argv.includes('--vercel'))for(const [name,value]of Object.entries(values))for(const target of ['production','preview'])execFileSync('npx',['--no-install','vercel','env','add',name,'--environment',target,'--yes','--no-sensitive','--scope','mateusz-pigulas-projects','--force'],{input:value,stdio:['pipe','ignore','pipe']});
console.log('Public client configuration saved; no admin credentials exposed.');
