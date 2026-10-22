import {noteName} from './audio';

export type EarMode='interval'|'direction'|'chord'|'note';
export interface EarQuestion {notes:number[];answer:string}
export const intervals=[
 {n:0,name:'Pryma',hint:'Ta sama wysokość, powtórzona dwa razy.'},
 {n:1,name:'Sekunda mała',hint:'Najmniejszy krok: sąsiednie progi. Bardzo ciasne brzmienie.'},
 {n:2,name:'Sekunda wielka',hint:'Cały ton: dwa progi. Mały krok melodii, szerszy od sekundy małej.'},
 {n:3,name:'Tercja mała',hint:'Trzy półtony. To tercja budująca akord molowy.'},
 {n:4,name:'Tercja wielka',hint:'Cztery półtony. O półton szersza od tercji małej; buduje akord durowy.'},
 {n:5,name:'Kwarta',hint:'Pięć półtonów. Porównuj z kwintą: kwarta ma mniejszy skok.'},
 {n:6,name:'Tryton',hint:'Sześć półtonów, dokładnie pół oktawy. Napięte brzmienie pomiędzy kwartą a kwintą.'},
 {n:7,name:'Kwinta',hint:'Siedem półtonów. Otwarty, stabilny skok; mniejszy od oktawy.'},
 {n:8,name:'Seksta mała',hint:'O półton ponad kwintę. Szeroki skok, ale do oktawy brakuje jeszcze czterech półtonów.'},
 {n:9,name:'Seksta wielka',hint:'O cały ton ponad kwintę. Szersza od seksty małej o jeden półton.'},
 {n:10,name:'Septyma mała',hint:'Duży skok: do oktawy brakuje całego tonu.'},
 {n:11,name:'Septyma wielka',hint:'Prawie oktawa: do jej osiągnięcia brakuje półtonu.'},
 {n:12,name:'Oktawa',hint:'Ta sama nazwa nuty, ale wyższy rejestr. Drugi dźwięk ma dwa razy wyższą częstotliwość.'},
];
export const semitoneCount=(n:number)=>`${n} ${n===1?'półton':n>=2&&n<=4?'półtony':'półtonów'}`;
export const noteLabel=(midi:number)=>`${noteName(midi)}${Math.floor(midi/12)-1}`;
export function makeEarQuestion(mode:EarMode,allowed:number[]):EarQuestion{
 const root=48+Math.floor(Math.random()*12);
 if(mode==='interval'){const n=allowed[Math.floor(Math.random()*allowed.length)];return {notes:[root,root+n],answer:intervals.find(i=>i.n===n)!.name};}
 if(mode==='direction'){const d=[-1,0,1][Math.floor(Math.random()*3)];return {notes:[root,root+d*(2+Math.floor(Math.random()*6))],answer:d<0?'W dół':d>0?'W górę':'Ten sam'};}
 if(mode==='chord'){const minor=Math.random()<.5;return {notes:[root,root+(minor?3:4),root+7],answer:minor?'Moll':'Dur'};}
 const pitch=root+Math.floor(Math.random()*6);return {notes:[pitch],answer:noteName(pitch)};
}
export function explainEarAnswer(mode:EarMode,q:EarQuestion){
 const distance=q.notes[1]-q.notes[0];
 if(mode==='interval')return `Od pierwszej do drugiej nuty: ${semitoneCount(distance)}. ${intervals.find(i=>i.n===distance)!.hint}`;
 if(mode==='direction')return distance===0?'Obie nuty mają tę samą wysokość. Zmiana głośności lub wybrzmiewanie nie oznacza zmiany nuty.':`Druga nuta jest ${distance>0?'wyżej':'niżej'} o ${semitoneCount(Math.abs(distance))}. Słuchaj wysokości, nie głośności.`;
 if(mode==='chord')return `Od podstawy: 0, ${distance}, 7 półtonów. ${distance===3?'Tercja mała (3 półtony) tworzy moll.':'Tercja wielka (4 półtony) tworzy dur.'} Kwinta jest taka sama w obu akordach.`;
 const fromC=q.notes[0]-60;
 return `${noteLabel(q.notes[0])} ${fromC===0?'to dźwięk odniesienia C4.':`leży ${semitoneCount(Math.abs(fromC))} ${fromC>0?'powyżej':'poniżej'} C4.`} W odpowiedzi wybierasz nazwę nuty, bez oktawy.`;
}
