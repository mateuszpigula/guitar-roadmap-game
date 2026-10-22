import {Moon,Sun,Monitor} from 'lucide-react';
import {useTheme,type ThemePreference} from '../theme';

export function ThemePicker(){
 const {preference,theme,changePreference,persistent}=useTheme();
 const Icon=preference==='system'?Monitor:theme==='dark'?Moon:Sun;
 return <div className="theme-control">
  <label className="theme-picker"><Icon size={16} aria-hidden="true"/><span className="sr-only">Motyw kolorystyczny</span>
   <select value={preference} onChange={e=>changePreference(e.target.value as ThemePreference)}>
    <option value="system">Systemowy</option><option value="light">Jasny</option><option value="dark">Ciemny</option>
   </select>
  </label>
  {!persistent&&<span className="theme-storage-note" role="status">Motyw działa w tej sesji. Przeglądarka blokuje zapamiętanie ustawienia.</span>}
 </div>;
}
