import {createContext,useContext,useEffect,useLayoutEffect,useState,type ReactNode} from 'react';

export type ThemePreference='system'|'light'|'dark';
export type Theme='light'|'dark';
export const THEME_KEY='guitar-quest-theme';
const preference=(value:unknown):ThemePreference=>value==='light'||value==='dark'?value:'system';
function savedPreference(){try{return preference(localStorage.getItem(THEME_KEY));}catch{return 'system' as const;}}
const ThemeContext=createContext({preference:'system' as ThemePreference,theme:'light' as Theme,changePreference:(_next:ThemePreference)=>{},persistent:true});

export function ThemeProvider({children}:{children:ReactNode}){
 const [choice,setChoice]=useState<ThemePreference>(savedPreference);
 const [systemDark,setSystemDark]=useState(()=>window.matchMedia?.('(prefers-color-scheme: dark)').matches??false);
 const [persistent,setPersistent]=useState(true);
 const theme:Theme=choice==='system'?(systemDark?'dark':'light'):choice;
 useEffect(()=>{
  const media=window.matchMedia?.('(prefers-color-scheme: dark)');
  const onSystem=()=>setSystemDark(media?.matches??false);
  const onStorage=(event:StorageEvent)=>{if(event.key===THEME_KEY||event.key===null){setChoice(savedPreference());setPersistent(true);}};
  media?.addEventListener('change',onSystem);window.addEventListener('storage',onStorage);onSystem();
  return ()=>{media?.removeEventListener('change',onSystem);window.removeEventListener('storage',onStorage);};
 },[]);
 useLayoutEffect(()=>{
  document.documentElement.dataset.theme=theme;
  document.documentElement.style.colorScheme=theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#191d1a':'#f8f6f0');
 },[theme]);
 function changePreference(next:ThemePreference){
  setChoice(next);
  try{localStorage.setItem(THEME_KEY,next);setPersistent(true);}catch{setPersistent(false);}
 }
 return <ThemeContext.Provider value={{preference:choice,theme,changePreference,persistent}}>{children}</ThemeContext.Provider>;
}
export const useTheme=()=>useContext(ThemeContext);
