import {useRef,useState} from 'react';
import {Check,ChevronRight,Volume2} from 'lucide-react';
import {noteNames,playNotes} from '../audio';
import {explainEarAnswer,intervals,makeEarQuestion,noteLabel,semitoneCount,type EarMode} from '../earTraining';

const modes:[EarMode,string][]=[['interval','Interwały'],['direction','Kierunek'],['chord','Dur / moll'],['note','Dźwięki']];
const guides:Record<EarMode,{task:string;tips:string[]}>={
 interval:{task:'Usłyszysz dwie nuty po kolei, od niższej do wyższej (albo tę samą dwa razy). Wybierz nazwę odległości między nimi — interwału.',tips:['Zanuć pierwszy dźwięk, potem drugi. Skup się na wielkości skoku, nie na nazwach nut.','Na początek zostaw dwa interwały, np. tercję małą i wielką. Gdy rozpoznajesz je pewniej, dodaj kwintę i oktawę.','Po odpowiedzi porównaj nuty na gitarze: jeden próg na tej samej strunie to jeden półton.']},
 direction:{task:'Usłyszysz dwie nuty po kolei. Wskaż, czy drugi dźwięk jest niższy, taki sam czy wyższy.',tips:['Zanuć obie nuty i śledź, czy głos idzie w dół, czy w górę. Nie trzeba znać ich nazw.','Wyższy dźwięk jest bardziej „cienki”, niższy bardziej „głęboki”. Głośniej nie znaczy wyżej.','Jeśli trudno porównać, odtwórz przykład jeszcze raz. Po odpowiedzi zobaczysz kierunek i wielkość zmiany.']},
 chord:{task:'Usłyszysz trzy nuty jednocześnie — akord durowy lub molowy. Rozpoznaj jego rodzaj.',tips:['W obu rodzajach podstawa i kwinta są takie same. Różni je środkowy dźwięk: tercja mała w moll, wielka w dur.','Dur bywa odbierany jako jaśniejszy, moll jako ciemniejszy. To pomocnicze skojarzenie, nie niezawodny test „wesoły czy smutny”.','Po odpowiedzi posłuchaj nut osobno. Zwróć uwagę na odległość pierwszej od drugiej: 3 półtony w moll, 4 w dur.']},
 note:{task:'Usłyszysz jedną nutę. Wybierz jej nazwę, porównując ją z przyciskiem „Posłuchaj C4” — nie potrzebujesz słuchu absolutnego.',tips:['Najpierw zapamiętaj C4: na gitarze to struna 2 (B), próg 1. Potem posłuchaj zagadki i porównaj wysokości.','Zanuć drogę od C4 do usłyszanej nuty lub sprawdź ją na gryfie. Przykłady obejmują również oktawę poniżej C4.','♯ podwyższa o półton, ♭ obniża o półton. B oznacza polskie H, a B♭ polskie B. Cyfra po odpowiedzi oznacza oktawę.']},
};

export function EarQuiz(){
 const [mode,setMode]=useState<EarMode>('interval'),[allowed,setAllowed]=useState([3,4,7,12]);
 const [q,setQ]=useState(()=>makeEarQuestion('interval',[3,4,7,12])),[answer,setAnswer]=useState(''),[played,setPlayed]=useState(false),[score,setScore]=useState({correct:0,total:0}),[error,setError]=useState('');
 const generation=useRef(0);
 function newQuestion(m=mode,selection=allowed){generation.current++;setQ(makeEarQuestion(m,selection));setAnswer('');setPlayed(false);setError('');}
 function reset(m:EarMode,selection=allowed){setMode(m);newQuestion(m,selection);setScore({correct:0,total:0});}
 async function listen(notes:number[],together=false,question=false){
  const current=generation.current;setError('');
  try{await playNotes(notes,together);if(current===generation.current&&question)setPlayed(true);}
  catch{if(current===generation.current)setError('Nie udało się odtworzyć dźwięku. Spróbuj ponownie.');}
 }
 const options=mode==='interval'?intervals.filter(i=>allowed.includes(i.n)).map(i=>i.name):mode==='direction'?['W dół','Ten sam','W górę']:mode==='chord'?['Dur','Moll']:noteNames;
 return <section className="panel quiz-panel" aria-labelledby="ear-quiz-title">
  <div className="row"><div><div className="section-label">04 / TRENING SŁUCHU</div><h2 id="ear-quiz-title">Najpierw posłuchaj</h2></div><span className="score" aria-label={`Wynik: ${score.correct} z ${score.total}`}>{score.correct} / {score.total}</span></div>
  <div className="chips">{modes.map(([m,label])=><button key={m} aria-pressed={mode===m} className={mode===m?'selected':''} onClick={()=>reset(m)}>{label}</button>)}</div>
  {mode==='interval'&&<details><summary>Wybierz interwały ({allowed.length})</summary><div className="interval-options">{intervals.map(i=><label key={i.n}><input type="checkbox" checked={allowed.includes(i.n)} onChange={()=>{const next=allowed.includes(i.n)?allowed.filter(n=>n!==i.n):[...allowed,i.n];if(!next.length)return;setAllowed(next);reset(mode,next);}}/>{i.name}</label>)}</div></details>}
  {mode==='note'&&<p className="ear-reference"><button className="secondary" onClick={()=>void listen([60])}><Volume2 size={16}/> Posłuchaj C4</button><span className="small">Twój punkt odniesienia przed każdą próbą.</span></p>}
  <button className="listen-button" onClick={()=>void listen(q.notes,mode==='chord',true)}><Volume2 size={27}/>{played?'Posłuchaj jeszcze raz':'Odtwórz przykład'}</button>
  <div className="quiz-answers">{options.map(option=><button key={option} disabled={!played||!!answer} className={answer&&(option===q.answer?'correct':option===answer?'incorrect':'')} onClick={()=>{setAnswer(option);setScore(s=>({total:s.total+1,correct:s.correct+(option===q.answer?1:0)}));}}>{option}{answer&&option===q.answer&&<Check size={16}/>}</button>)}</div>
  {answer&&<div className="ear-result">
   <div className="quiz-feedback" role="status"><strong>{answer===q.answer?`Dobrze słyszysz — ${q.answer.toLocaleLowerCase('pl')}.`:`Poprawna odpowiedź: ${q.answer}.`}</strong><button className="secondary" onClick={()=>newQuestion()}>Następny <ChevronRight size={16}/></button></div>
   <h3>Zagrane dźwięki</h3><p className="ear-note-sequence">{q.notes.map(noteLabel).join(mode==='chord'?' + ':' → ')}</p>
   <p>{mode==='chord'?'Zagrane jednocześnie. ':q.notes.length>1?'Zagrane kolejno. ':''}{explainEarAnswer(mode,q)}</p>
   <div className="ear-note-buttons" aria-label="Odsłuch zagranych dźwięków">{q.notes.map((note,i)=><button className="secondary" key={i} onClick={()=>void listen([note])} aria-label={`Posłuchaj dźwięku ${i+1}: ${noteLabel(note)}`}><Volume2 size={15}/>{i+1}. {noteLabel(note)}</button>)}</div>
   <p className="small">Cyfra to oktawa. B = polskie H, B♭ = polskie B.</p>
  </div>}
  {error&&<p role="alert">{error}</p>}
  <div className="ear-guide"><h3>Na czym polega to ćwiczenie?</h3><p>{guides[mode].task}</p><h3>Jak rozróżniać?</h3><ul>{guides[mode].tips.map(tip=><li key={tip}>{tip}</li>)}</ul>
   {mode==='interval'&&<dl className="ear-interval-guide">{intervals.filter(i=>allowed.includes(i.n)).map(i=><div key={i.n}><dt>{i.name} <span>· {semitoneCount(i.n)}</span></dt><dd>{i.hint}</dd></div>)}</dl>}
  </div>
  <p className="small">Wynik dotyczy bieżącej serii. Nowy tryb lub zestaw interwałów rozpoczyna nową serię.</p>
 </section>;
}
