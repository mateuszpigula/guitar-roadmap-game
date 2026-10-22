import {useEffect,useRef,useState} from 'react';
import {Mic,MicOff,Check,ArrowRight} from 'lucide-react';
import {useMicrophone} from '../microphone/useMicrophone';
import {advanceHold,frequencyFor,MIN_SIGNAL_RMS,pitchLabel,type Reading} from '../microphone/pitch';
import {emptyTuner,trackTuner} from '../microphone/tuner';
import {useTunerText} from '../microphone/useTunerText';
const strings=[{midi:40,label:'6 · E2'},{midi:45,label:'5 · A2'},{midi:50,label:'4 · D3'},{midi:55,label:'3 · G3'},{midi:59,label:'2 · B3'},{midi:64,label:'1 · E4'}];
const rounds=[
 {midi:60,hint:'Struna 2 (B), próg 1'}, {midi:64,hint:'Struna 1 (cienka E), pusta'},
 {midi:62,hint:'Struna 2 (B), próg 3'}, {midi:67,hint:'Struna 1 (cienka E), próg 3'},
 {midi:65,hint:'Struna 1 (cienka E), próg 1'},
];
function NoteGame({reading,listening}:{reading:Reading;listening:boolean}){
 const [index,setIndex]=useState(0),[matched,setMatched]=useState(false),[progress,setProgress]=useState(0);
 const [hint,setHint]=useState(false),[finished,setFinished]=useState(false);
 const hold=useRef<number|null>(null),last=useRef(0),boundary=useRef(0);
 const target=rounds[index];
 useEffect(()=>{
  if(matched||finished)return;
  if(!listening||reading.at<=boundary.current){hold.current=null;setProgress(0);return;}
  if(reading.at-last.current>250)hold.current=null;
  last.current=reading.at;
  const next=advanceHold(hold.current,reading,target.midi);hold.current=next.since;setProgress(next.progress);
  if(next.progress===1)setMatched(true);
 },[reading,listening,matched,finished,target.midi]);
 function next(){
  boundary.current=performance.now();hold.current=null;setProgress(0);setMatched(false);setHint(false);
  if(index===rounds.length-1)setFinished(true);else setIndex(index+1);
 }
 function reset(){boundary.current=performance.now();hold.current=null;setIndex(0);setMatched(false);setProgress(0);setFinished(false);setHint(false);}
 return <div className="note-game">
  <div className="mic-game-heading"><h3>Znajdź dźwięk</h3><span>{finished?5:index+(matched?1:0)} / 5 trafień</span></div>
  {finished?<div className="mic-complete" role="status"><Check size={32}/><h3>Pięć dźwięków. Dobra robota.</h3><p>Wróć do tej serii, aż znajdziesz je bez podpowiedzi.</p><button className="secondary" onClick={reset}>Powtórz serię</button></div>:<>
   <p>Zagraj pojedynczy dźwięk <strong>{pitchLabel(target.midi)}</strong> i pozwól mu wybrzmieć przez około sekundę.</p>
   <div className="mic-target" aria-label={`Zagraj ${pitchLabel(target.midi)}`}>{pitchLabel(target.midi)}</div>
   <progress aria-label="Stabilność właściwego dźwięku" max={1} value={progress}/>
   <p className={`mic-game-message ${matched?'is-matched':''}`} role="status">{matched?'Trafione! Właściwy dźwięk i oktawa.':!listening?'Włącz mikrofon, gdy będziesz gotowy.':progress>0?'Tak, pozwól mu wybrzmieć…':reading.pitch?`Słyszę ${pitchLabel(reading.pitch.midi)}. Szukamy ${pitchLabel(target.midi)}.`:'Słucham. Zagraj jedną strunę.'}</p>
   <div className="mic-game-actions"><button className="text-button" onClick={()=>setHint(!hint)} aria-expanded={hint}>{hint?'Ukryj podpowiedź':'Pokaż miejsce na gryfie'}</button><button className="secondary" disabled={!matched} onClick={next}>{index===4?'Zakończ serię':'Następny dźwięk'} <ArrowRight size={16}/></button></div>
   {hint&&<p className="mic-hint">{target.hint}. Mikrofon sprawdza wysokość dźwięku, nie wybraną strunę ani palec.</p>}
  </>}
  <p className="small">Seria ćwiczeniowa bez XP i automatycznego zaliczania lekcji. Wynik dotyczy tej sesji. Cyfra przy nucie oznacza oktawę.</p>
 </div>;
}
export function MicrophonePractice(){
 const mic=useMicrophone();const [mode,setMode]=useState<'tuner'|'game'>('tuner'),[string,setString]=useState<number|'auto'>('auto');
 const listening=mic.status==='listening',busy=mic.status==='requesting';
 // Derive the tracker before committing the render: an effect briefly paired a new
 // reading with the old tracker, incorrectly flashing ‘Ostatni odczyt’ every frame.
 const [tracking,setTracking]=useState({reading:mic.reading,listening:false,track:emptyTuner});
 let tracked=tracking.track;
 if(tracking.reading!==mic.reading||tracking.listening!==listening){
  tracked=listening?trackTuner(tracked,mic.reading):emptyTuner;
  setTracking({reading:mic.reading,listening,track:tracked});
 }
 const pitch=listening?tracked.pitch:null;
 const held=!!pitch&&tracked.at!==mic.reading.at;
 const levelDb=mic.reading.level>0?Math.max(-80,20*Math.log10(mic.reading.level)):-80;
 const target=string==='auto'?pitch?.midi:string;
 const cents=pitch&&target!==undefined?1200*Math.log2(pitch.frequency/frequencyFor(target)):null;
 const inTune=!held&&cents!==null&&Math.abs(cents)<=10;
 const message=!listening?'Gotowy, gdy Ty jesteś.':mic.reading.clipped?'Za głośno — odsuń telefon od gitary.':held?'Ostatni odczyt — zagraj strunę ponownie.':!pitch?(mic.reading.level<MIN_SIGNAL_RMS?'Czekam na dźwięk. Zagraj jedną strunę.':'Sygnał dociera. Szukam stabilnego dźwięku — wytłum pozostałe struny.'):
  inTune?'Dźwięk jest nastrojony.':cents!<0?'Za nisko — delikatnie podwyższ dźwięk.':'Za wysoko — delikatnie obniż dźwięk.';
 const text=useTunerText({pitch,cents,levelDb},message,`${listening}:${mode}:${string}`);
 const textHeld=text.message==='Ostatni odczyt — zagraj strunę ponownie.';
 function changeMode(next:'tuner'|'game'){mic.stop();setMode(next);}
 return <section className="panel microphone-panel" aria-labelledby="microphone-title">
  <div className="mic-heading"><div><div className="section-label">NA TWOJEJ GITARZE / MIKROFON</div><h2 id="microphone-title">Zagraj. Zobacz, co słyszysz.</h2><p>Strojenie i pierwsze dźwięki na gryfie. Jedna struna naraz.</p></div><span className={`mic-status ${listening?'is-on':''}`}><span/>{listening?'Mikrofon włączony':busy?'Czekam na zgodę':'Mikrofon wyłączony'}</span></div>
  <div className="chips" aria-label="Tryb mikrofonu"><button className={mode==='tuner'?'selected':''} aria-pressed={mode==='tuner'} onClick={()=>changeMode('tuner')}>Stroik</button><button className={mode==='game'?'selected':''} aria-pressed={mode==='game'} onClick={()=>changeMode('game')}>Znajdź dźwięk</button></div>
  <div className="mic-controls"><button className={listening||busy?'secondary':'primary'} onClick={()=>listening||busy?mic.stop():void mic.start()}>{listening||busy?<MicOff size={18}/>:<Mic size={18}/>} {listening?'Wyłącz mikrofon':busy?'Anuluj oczekiwanie':'Włącz mikrofon'}</button><span className="small">{busy?'Zezwól na użycie mikrofonu w oknie przeglądarki.':'Wyjście z Warsztatu lub ukrycie aplikacji wyłącza mikrofon.'}</span></div>
  {mic.error&&<div className="feedback-error" role="alert"><p>{mic.error}</p>{listening&&<button className="secondary" onClick={()=>void mic.start()}>Uruchom mikrofon ponownie</button>}</div>}
  <div className="mic-layout"><div className="mic-workspace">
   {mode==='tuner'?<><div className="mic-strings" aria-label="Struna do strojenia"><button className={string==='auto'?'selected':''} aria-pressed={string==='auto'} onClick={()=>setString('auto')}>Auto</button>{strings.map(s=><button key={s.midi} className={string===s.midi?'selected':''} aria-pressed={string===s.midi} onClick={()=>setString(s.midi)}>{s.label}</button>)}</div>
    <div className={`tuner-readout ${textHeld?'is-held':''} ${text.message==='Dźwięk jest nastrojony.'?'in-tune':''}`}><span className="small">{textHeld?'Ostatni odczyt':string==='auto'?'Rozpoznany dźwięk':`Cel: ${pitchLabel(string)} · struna ${strings.find(s=>s.midi===string)?.label.split(' · ')[0]}`}</span><strong>{text.value.pitch?pitchLabel(text.value.pitch.midi):'—'}</strong><span>{text.value.pitch?`${text.value.pitch.frequency.toFixed(1)} Hz`:'Zagraj pustą strunę'}</span></div>
    <div className="tuner-scale" aria-hidden="true"><span className="tuner-center"/>{cents!==null&&<span className={`tuner-needle ${inTune?'in-tune':''}`} style={{left:`${50+Math.max(-50,Math.min(50,cents))}%`}}/>}</div><div className="tuner-labels"><span>−50 ¢</span><span>{text.value.cents===null?'0':`${text.value.cents>0?'+':''}${Math.round(text.value.cents)} ¢`}</span><span>+50 ¢</span></div>
    <p className="tuner-message" role="status">{text.message}</p><p className="small">A4 = 440 Hz · B = polskie H. W trybie Auto najbliższa nuta nie musi być właściwą pustą struną — wybierz strunę, aby ustalić cel.</p>
   </>:<NoteGame reading={mic.reading} listening={listening}/>}
  </div><aside className="mic-guide"><h3>Mała chwila na przygotowanie</h3><ol><li>Wyłącz metronom i odsłuchy. Usiądź w spokojnym miejscu.</li><li>Ustaw telefon blisko gitary. Zagraj jedną strunę, pozostałe wytłum.</li><li>Szarp strunę i pozwól jej wybrzmieć. Poprzedni wynik pozostaje przez chwilę oznaczony jako „Ostatni odczyt”.</li></ol><p className="small">Rozpoznajemy pojedyncze dźwięki, nie akordy. Wynik zależy od mikrofonu i otoczenia.</p><div className="mic-level"><label htmlFor="microphone-level">Poziom sygnału {listening&&<span>· {text.value.levelDb<=-80?'brak':`${Math.round(text.value.levelDb)} dBFS`}</span>}</label><meter id="microphone-level" min={-80} max={0} value={levelDb}/><p className="small">Pasek reaguje także na ciche dźwięki. Jeśli nie porusza się podczas grania, wyłącz i włącz mikrofon.</p></div><p className="mic-privacy">Dźwięk jest analizowany na urządzeniu. Nie nagrywamy go ani nie wysyłamy na serwer.</p></aside></div>

 </section>;
}
