import {useState} from 'react';
import {curriculumVersion} from '../content/catalog';
import {contentCache,fetchRelease} from '../content/repository';
import type {ContentStatus as Status} from '../content/repository';
export function ContentStatus({status}:{status:Status}){
 const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function check(){setBusy(true);setMessage('');try{const r=await fetchRelease();if(!r)throw new Error('Połącz się z internetem, żeby sprawdzić aktualizacje.');if(r.version>curriculumVersion){await contentCache().write(r);setMessage(`Dostępna wersja ${r.version}. Po zapisaniu postępu odśwież aplikację, aby ją otworzyć.`);}else setMessage('Masz aktualną wersję programu.');}catch(e){setMessage(e instanceof Error?e.message:'Nie udało się sprawdzić aktualizacji.');}finally{setBusy(false);}}
 return <section className="panel content-status"><div><span className="section-label">TWÓJ PROGRAM</span><h2>Wersja {status.version}</h2><p>{status.origin==='cloud'?'Pobrana z Supabase':status.origin==='cache'?'Ostatnia kopia na tym urządzeniu':'Program dołączony do aplikacji'}. Aktualizacje treści zachowują wcześniejsze zaliczenia.</p>{status.warning&&<p role="status">{status.warning}</p>}</div><button className="secondary" disabled={busy} onClick={()=>void check()}>{busy?'Sprawdzam…':'Sprawdź aktualizację'}</button>{message&&<p role="status">{message}</p>}</section>;
}
