import {Moon,Sun,Monitor} from 'lucide-react';
import {useTheme,type ThemePreference} from '../theme';

const options: {value:ThemePreference;label:string;Icon:typeof Sun}[]=[
 {value:'light',label:'Jasny',Icon:Sun},
 {value:'dark',label:'Ciemny',Icon:Moon},
 {value:'system',label:'Systemowy',Icon:Monitor},
];

export function ThemePicker(){
 const {preference,changePreference,persistent}=useTheme();
 return <div className="theme-control">
  <div className="theme-picker" role="group" aria-label="Motyw kolorystyczny" data-preference={preference}>
   {options.map(({value,label,Icon})=><button key={value} type="button" className="theme-option" aria-label={`Motyw: ${label.toLocaleLowerCase('pl')}`} aria-pressed={preference===value} onClick={()=>changePreference(value)}>
    <Icon size={19} strokeWidth={1.8} aria-hidden="true"/>
    <span className="theme-tooltip" aria-hidden="true">{label}</span>
   </button>)}
  </div>
  {!persistent&&<span className="theme-storage-note" role="status">Motyw działa w tej sesji. Przeglądarka blokuje zapamiętanie ustawienia.</span>}
 </div>;
}
