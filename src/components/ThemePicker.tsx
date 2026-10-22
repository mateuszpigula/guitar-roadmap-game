import {useEffect,useId,useRef,useState} from 'react';
import {Check,Moon,Sun,Monitor} from 'lucide-react';
import {useTheme,type ThemePreference} from '../theme';

const options: {value:ThemePreference;label:string;Icon:typeof Sun}[]=[
 {value:'light',label:'Jasny',Icon:Sun},
 {value:'dark',label:'Ciemny',Icon:Moon},
 {value:'system',label:'Systemowy',Icon:Monitor},
];

export function ThemePicker(){
 const {preference,changePreference,persistent}=useTheme();
 const [open,setOpen]=useState(false);
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),id=useId();
 const selected=options.find(option=>option.value===preference)!;
 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);trigger.current?.focus();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[open]);
 function choose(value:ThemePreference){changePreference(value);setOpen(false);trigger.current?.focus();}
 return <div className="theme-control" ref={root} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);}}>
  <button ref={trigger} type="button" className="theme-trigger" aria-label={`Zmień motyw (${selected.label.toLocaleLowerCase('pl')})`} title={`Motyw: ${selected.label.toLocaleLowerCase('pl')}`} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(value=>!value)}>
   <selected.Icon size={19} strokeWidth={1.8} aria-hidden="true"/>
  </button>
  {open&&<div id={id} className="theme-popover" role="group" aria-label="Motyw kolorystyczny">
   <span className="theme-popover-label">Wygląd</span>
   {options.map(({value,label,Icon})=><button key={value} type="button" className="theme-option" aria-label={`Motyw: ${label.toLocaleLowerCase('pl')}`} aria-pressed={preference===value} onClick={()=>choose(value)}>
    <Icon size={18} strokeWidth={1.8} aria-hidden="true"/><span>{label}</span>
    {preference===value&&<Check size={16} aria-hidden="true"/>}
   </button>)}
  </div>}
  {!persistent&&<span className="theme-storage-note" role="status">Motyw działa w tej sesji. Przeglądarka blokuje zapamiętanie ustawienia.</span>}
 </div>;
}
