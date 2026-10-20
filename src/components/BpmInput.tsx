import { useEffect, useState } from 'react';
export function BpmInput({value,onChange}:{value:number;onChange:(value:number)=>void}){
 const [draft,setDraft]=useState(String(value));
 useEffect(()=>setDraft(String(value)),[value]);
 return <input type="number" min={30} max={240} step={1} value={draft} onChange={e=>{const raw=e.target.value;setDraft(raw);const n=Number(raw);if(raw&&Number.isInteger(n)&&n>=30&&n<=240)onChange(n);}} onBlur={()=>{const n=Number(draft);const normalized=draft&&Number.isFinite(n)?Math.min(240,Math.max(30,Math.round(n))):value;setDraft(String(normalized));onChange(normalized);}}/>;
}
