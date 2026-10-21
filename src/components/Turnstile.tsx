import {useEffect,useRef,useState} from 'react';

type TurnstileApi={
  render:(element:HTMLElement,options:Record<string,unknown>)=>string;
  remove:(id:string)=>void;
};
declare global {interface Window {turnstile?:TurnstileApi}}
let loading:Promise<TurnstileApi>|undefined;
function loadTurnstile(){
  if(window.turnstile)return Promise.resolve(window.turnstile);
  if(loading)return loading;
  loading=new Promise<TurnstileApi>((resolve,reject)=>{
    const script=document.createElement('script');
    const timeout=window.setTimeout(fail,15000);
    function fail(){window.clearTimeout(timeout);script.remove();loading=undefined;reject(new Error('Turnstile unavailable'));}
    script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async=true;
    script.onload=()=>{window.clearTimeout(timeout);if(window.turnstile)resolve(window.turnstile);else fail();};
    script.onerror=fail;
    document.head.append(script);
  });
  return loading;
}

export function Turnstile({siteKey,onToken}:{siteKey:string;onToken:(token:string)=>void}){
  const container=useRef<HTMLDivElement>(null);
  const callback=useRef(onToken);
  callback.current=onToken;
  const [attempt,setAttempt]=useState(0),[error,setError]=useState('');
  useEffect(()=>{
    let active=true,id:string|undefined,api:TurnstileApi|undefined;
    callback.current('');setError('');
    const clear=(message:string)=>{if(active){callback.current('');setError(message);}};
    void loadTurnstile().then(loaded=>{
      if(!active||!container.current)return;
      api=loaded;
      id=api.render(container.current,{
        sitekey:siteKey,theme:'light',size:container.current.clientWidth<300?'compact':'flexible',language:'pl',
        'response-field':false,
        callback:(token:string)=>{if(active){setError('');callback.current(token);}},
        'expired-callback':()=>clear('Weryfikacja wygasła. Poczekaj na ponowne sprawdzenie lub spróbuj ponownie.'),
        'timeout-callback':()=>clear('Weryfikacja trwała zbyt długo. Spróbuj ponownie.'),
        'error-callback':()=>{clear('Nie udało się zweryfikować przeglądarki. Sprawdź połączenie i spróbuj ponownie.');return true;},
        'unsupported-callback':()=>clear('Ta przeglądarka nie obsługuje weryfikacji. Otwórz aplikację w aktualnej przeglądarce.'),
      });
    }).catch(()=>clear('Nie udało się wczytać weryfikacji. Sprawdź połączenie lub blokowanie Cloudflare w przeglądarce.'));
    return ()=>{active=false;if(id!==undefined)api?.remove(id);};
  },[siteKey,attempt]);
  return <div className="account-captcha"><span className="small">Weryfikacja bezpieczeństwa</span><div ref={container}/>{error&&<><p className="error" role="alert">{error}</p><button type="button" className="text-button" onClick={()=>setAttempt(n=>n+1)}>Ponów weryfikację</button></>}</div>;
}
