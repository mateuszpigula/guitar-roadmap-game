import {useEffect,useRef,useState} from 'react';

const TEXT_INTERVAL_MS=400;

// Sample numerical labels, but debounce instructions: brief pitch fluctuations
// should move the needle without repeatedly announcing a new tuning direction.
export function useTunerText<T>(value:T,message:string,context:string){
 const latest=useRef(value);
 const [sample,setSample]=useState({context,value});
 const [instruction,setInstruction]=useState({context,message});
 useEffect(()=>{latest.current=value;},[value]);
 useEffect(()=>{
  setSample({context,value:latest.current});
  const timer=setInterval(()=>setSample({context,value:latest.current}),TEXT_INTERVAL_MS);
  return ()=>clearInterval(timer);
 },[context]);
 useEffect(()=>{
  const timer=setTimeout(()=>setInstruction({context,message}),TEXT_INTERVAL_MS);
  return ()=>clearTimeout(timer);
 },[message,context]);
 // Stop, restart, mode and target changes must not show the previous context.
 if(instruction.context!==context)setInstruction({context,message});
 return {value:sample.context===context?sample.value:value,message:instruction.context===context?instruction.message:message};
}
