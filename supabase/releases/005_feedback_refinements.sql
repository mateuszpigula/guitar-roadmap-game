-- Program 5: feedback refinements and specific lesson references.
-- Guard the reviewed release and untouched draft. Preserve progress and all task IDs.
begin;
select pg_advisory_xact_lock(20261021,1);
do $publish$
declare previous jsonb; next_content jsonb; latest integer; patch jsonb := $patch${
  "lessons": [
    {
      "id": "ch-01-6",
      "source": "v5-pulse"
    },
    {
      "id": "deep-01-3",
      "source": "v5-theory-12"
    },
    {
      "id": "deep-01-5",
      "source": "v5-theory-13"
    },
    {
      "id": "deep-01-6",
      "source": "v5-memory"
    },
    {
      "id": "rep-01",
      "theory": "Wybierz jedną melodię lub riff z trzech opcji. Na tym etapie NIE musisz zagrać całego utworu z pamięci: możesz korzystać z TAB lub własnej ściągi. Zaliczenie oznacza samodzielne granie bez kopiowania ruchu nauczyciela na bieżąco i bez pauzowania filmu po każdej nucie. Pamięć budujemy krótkimi fragmentami, nie wielokrotnym odtwarzaniem całego filmu.",
      "steps": [
        "Wybierz jeden utwór. Obejrzyj wykonanie, potem zatrzymaj film i sprawdź zakres do zaliczenia: melodia albo riff. Przygotuj TAB lub krótką notatkę z kolejnością fragmentów.",
        "Weź 2–4 dźwięki, które tworzą krótki motyw. Powiedz na głos struny i progi, zanuc rytm, następnie zagraj 3 razy powoli, patrząc na zapis.",
        "Zasłoń zapis na jedną próbę. Jeśli utkniesz, odsłoń tylko trudne miejsce, popraw je i spróbuj ponownie. To ćwiczenie pamięci, nie warunek zaliczenia całej melodii.",
        "Naucz się następnego krótkiego fragmentu. Połącz koniec pierwszego z początkiem drugiego, potem oba w całość. Nie zaczynaj za każdym razem od początku utworu.",
        "Wykonaj cały wskazany zakres z dozwoloną ściągą, ale bez prowadzącego filmu. Następnego dnia spróbuj najpierw z pamięci, po czym zajrzyj do zapisu i popraw jedno miejsce. Zaliczenie nie wymaga gry bez nut."
      ],
      "example": "POZNANIE: zobacz 2–4 dźwięki → powiedz struny/progi → zagraj 3 razy\nPAMIĘĆ: zasłoń → spróbuj → sprawdź tylko lukę\nŁĄCZENIE: koniec A + początek B → całe A + B\nZALICZENIE: samodzielnie, ze ściągą jeśli potrzebujesz; bez odtwarzania filmu nuta po nucie.",
      "criteria": [
        "Zagrałem zakres wybranego utworu samodzielnie; mogłem korzystać z TAB lub notatki, ale nie grałem za nauczycielem krok po kroku.",
        "Powtórzyłem wykonanie w innym dniu i wskazałem jedno poprawione miejsce. Gra całego utworu z pamięci nie jest wymagana."
      ],
      "mistake": "Samo oglądanie i granie razem z filmem daje złudzenie pamięci. Krótka próba po jego zatrzymaniu pokazuje, co już umiesz. Nie odmawiaj sobie zaliczenia tylko dlatego, że jeszcze zaglądasz do zapisu.",
      "source": "v5-memory"
    },
    {
      "id": "side-01-2",
      "source": "v5-play-ear"
    },
    {
      "id": "branch-01-2",
      "source": "v5-play-ear"
    },
    {
      "id": "ch-02-1",
      "source": "v5-em"
    },
    {
      "id": "ch-02-2",
      "source": "v5-am"
    },
    {
      "id": "ch-02-3",
      "theory": "Ćwiczysz tylko Em ↔ Am. Takty mają po cztery pulsy (4/4). Na raz grasz akord, na dwa–trzy–cztery liczysz i przygotowujesz następny chwyt. Celem jest trafienie nowym akordem w kolejne raz, a nie szybkie bicie. Diagramy poniżej pokazują numery palców; w ciągu 022000 są numery progów.",
      "steps": [
        "Sprawdź Em i Am ze ściągą poniżej: szarp każdą dozwoloną strunę osobno. W Em grasz struny 6–1, w Am tylko 5–1.",
        "Bez kliku ułóż Em, puść nacisk i ułóż Am. Powtórz 5 razy. W pokazanym palcowaniu palce 2 i 3 przenoszą się o strunę, a palec 1 dochodzi na strunę 2/próg 1.",
        "Ustaw 50 BPM i metrum 4/4. Posłuchaj czterech kliknięć. Na następne raz zagraj Em jednym ruchem kciuka w dół. Na dwa–trzy–cztery nie uderzaj strun; przygotuj Am.",
        "Na kolejne raz zagraj Am. Kontynuuj naprzemiennie przez 8 taktów: 4 Em i 4 Am. Ściąga może pozostać otwarta. To 7 zmian między taktami, nie 8.",
        "Zapisz, ile z 7 zmian wypadło na raz. Jeśli się spóźniasz, przećwicz sam ruch bez kliku i ponów. Dopiero po płynnej próbie dodaj uderzenie także na trzy; to wariant dodatkowy."
      ],
      "example": "Takt:   1       2       3       4       5       6       7       8\nAkord:  Em      Am      Em      Am      Em      Am      Em      Am\nPuls:   1 2 3 4 w KAŻDYM takcie\nGraj:   ↓ – – –   (↓ tylko na 1; resztę licz dalej)\nEm: struny 6–1. Am: struny 5–1. Ściąga dozwolona.",
      "criteria": [
        "Zagraj 8 taktów naprzemiennie Em–Am przy 50 BPM, uderzając każdy akord na pierwszym pulsie bez zatrzymywania liczenia.",
        "Zapisz liczbę punktualnych zmian (maksymalnie 7) i jedno miejsce do poprawy."
      ],
      "mistake": "Gdy chwyt nie zdąży na raz, nie dokładaj piątego pulsu do taktu. Zatrzymaj próbę po 8 taktach i poćwicz tę zmianę osobno.",
      "source": "v5-changes"
    },
    {
      "id": "ch-02-4",
      "theory": "Poznasz trzy chwyty w osobnych krótkich sesjach: C, G i D. Korzystaj ze ściągi przez całe ćwiczenie; nie musisz od razu pamiętać wszystkich kształtów. Cyfry w kropkach oznaczają palce lewej dłoni. Kciuk pozostaje za gryfem, a prawa dłoń sprawdza pojedyncze struny.",
      "steps": [
        "Sesja C: lewy 1 na strunie 2/progu 1, 2 na 4/2, 3 na 5/3. Struny 3 i 1 są puste. Nie graj struny 6. Zagraj osobno 5–4–3–2–1, popraw stłumiony dźwięk, zdejmij chwyt. Zrób 3 czyste ułożenia.",
        "Sesja G: lewy 2 na strunie 6/progu 3, 1 na 5/2, 3 na 1/3. Struny 4, 3 i 2 są puste. Sprawdź wszystkie sześć strun i zrób 3 czyste ułożenia. To wariant 320003 — nie czteropalcowe 320033.",
        "Sesja D: lewy 1 na strunie 3/progu 2, 3 na 2/3, 2 na 1/2. Struna 4 jest pusta; pomiń 6 i 5. Sprawdź 4–3–2–1 i zrób 3 czyste ułożenia.",
        "Gdy poznasz C i G, zmień C→G→C bez metronomu 4 razy. Później tak samo G→D→G. Jeden powrót do pierwszego chwytu kończy powtórzenie.",
        "Na koniec ustaw 50 BPM. Zagraj po jednym akordzie na raz: C przez 4 pulsy, G przez 4 pulsy. Wykonaj 4 zmiany. W osobnej próbie użyj G i D. Jeśli tempo przeszkadza, wróć do kroku 4."
      ],
      "example": "C: X 3 2 0 1 0 · gramy 5–1\nG: 3 2 0 0 0 3 · gramy 6–1\nD: X X 0 2 3 2 · gramy 4–1\nTo PROGI od struny 6 do 1. Palce są w kropkach diagramów.\nPlan: dzień 1 C → dzień 2 G → dzień 3 D (lub dłużej, według potrzeb).",
      "criteria": [
        "Każdy chwyt ułóż i sprawdź czysto 3 razy; możesz używać diagramów i rozłożyć zadanie na kilka dni.",
        "Wykonaj po 4 spokojne zmiany C–G i G–D, pamiętając, od której struny zaczynasz uderzenie."
      ],
      "mistake": "Nie próbuj opanować trzech nowych chwytów w pięć minut. Gdy nie brzmi pojedyncza struna, sprawdź, czy nie dotyka jej bok sąsiedniego palca. Nie dociskaj wszystkich palców mocniej.",
      "source": "v5-cgd"
    },
    {
      "id": "ch-02-5",
      "source": "v5-theory-11"
    },
    {
      "id": "ch-02-6",
      "source": "v5-strumming"
    },
    {
      "id": "ch-02-7",
      "source": "v5-theory-40"
    },
    {
      "id": "deep-02-3",
      "source": "v5-changes"
    },
    {
      "id": "deep-02-4",
      "source": "v5-strumming"
    },
    {
      "id": "deep-02-5",
      "theory": "Zwrotka (verse) zwykle niesie kolejne słowa opowieści; refren (chorus) wraca z rozpoznawalnym tekstem i melodią. Sekcja to większy fragment, a takt to cztery policzone pulsy w tym ćwiczeniu. A i B są tylko etykietami: tutaj A oznacza model zwrotki, B model refrenu. Same akordy nie zawsze pozwalają rozpoznać sekcję prawdziwej piosenki — zwrotka i refren mogą mieć te same chwyty. Najpierw wykonaj kompletny przykład autorski poniżej.",
      "steps": [
        "Bez gitary przeczytaj mapę: A = Em–Am–Em–Am (4 takty), B = C–G–Am–Em (4 takty). Jeden akord zajmuje cały takt, czyli liczenie 1–2–3–4.",
        "Ustaw 50 BPM, 4/4. Klaszcz tylko na 1 i wypowiadaj nazwę kolejnego akordu. Przejdź A, potem B: łącznie 8 taktów.",
        "Z gitarą zagraj osobno A, potem osobno B. Na 1 uderz akord, na 2–3–4 pozwól mu brzmieć i przygotuj kolejny. Diagramy są pod ręką; nie musisz grać z pamięci.",
        "Zagraj A→B→A→B, czyli 16 taktów. Przed nową sekcją powiedz A albo B i odczytaj jej pierwszy akord: Em dla A, C dla B. Nie powtarzaj dodatkowo pojedynczych taktów.",
        "Zapisz własnymi słowami: „A ma 4 takty, B ma 4 takty, całość ABAB ma 16 taktów”. Wskaż przejście Am→C na końcu A i Em→Em na przejściu B→A.",
        "Dopiero jako zastosowanie otwórz wybrany utwór ze Sceny 2. Posłuchaj zwrotki i refrenu, zaznacz ich początki w swojej notatce. Nie przenoś automatycznie mapy ABAB z ćwiczenia do nagrania — jego forma może być inna."
      ],
      "example": "ĆWICZENIE AUTORSKIE — to nie zapis znanej piosenki\n\nA / model zwrotki: | Em | Am | Em | Am | = 4 takty\nB / model refrenu: | C  | G  | Am | Em | = 4 takty\n\nCałość: A → B → A → B = 16 taktów\nNumery: 1–4  5–8  9–12  13–16\nW każdym takcie: 1 2 3 4. Uderz akord tylko na 1.\nPrzykład: A × 2 oznacza dwa CAŁE obiegi A = 8 taktów.",
      "criteria": [
        "Wyjaśnij różnicę: 1 takt = 4 pulsy, sekcja A = 4 takty, całość ABAB = 16 taktów.",
        "Zagraj ABAB ze ściągą przy 50 BPM, wchodząc w A akordem Em, a w B akordem C bez dodawania taktów."
      ],
      "mistake": "A nie jest nazwą akordu A-dur w tej mapie. To etykieta sekcji zaczynającej się od Em. Nie pomyl A × 2 z dwoma uderzeniami — powtarzasz wszystkie cztery takty.",
      "source": "v5-song-form",
      "minutes": 7
    },
    {
      "id": "deep-02-6",
      "source": "v5-perform"
    },
    {
      "id": "ch-02-8",
      "title": "Wyzwanie: pełna forma przed pierwszą piosenką",
      "theory": "To próba ciągłego akompaniamentu przygotowująca do znanej piosenki, nie zaliczenie całego nagrania artysty. Grasz autorskie 8 taktów opisane niżej. W następnym kroku „Scena 2: Piosenka przy ognisku” wybierzesz 1 z 3 znanych utworów i dostaniesz jego własny film oraz kryteria. Tutaj możesz przez cały czas patrzeć na akordy.",
      "steps": [
        "Ze ściągą sprawdź czysto Em, Am, C i G. Przejścia Am→C oraz C→G zagraj po 4 razy osobno, bez kliku.",
        "Ustaw 60 BPM i metrum 4/4. Najpierw odczytaj 8 taktów bez grania, licząc na każdy akord 1–2–3–4.",
        "Zagraj kolejno: Em, Am, Em, Am, C, G, Am, Em. Każdy akord zajmuje 1 takt. Uderzaj lekko kciukiem na każdy z 4 pulsów; Em i G od struny 6, Am i C od 5.",
        "Powtórz te 8 taktów jeszcze raz bez pauzy: całość liczy 16 taktów. Po ostatnim takcie Em pozwól wybrzmieć i zatrzymaj metronom. Ściąga jest dozwolona.",
        "Po zaliczeniu otwórz następny krok — Scenę 2. Wybierz Three Little Birds, A Horse with No Name albo Knockin’ on Heaven’s Door. Dopiero wykonanie wybranej wersji zalicza repertuar sceny."
      ],
      "example": "| Em | Am | Em | Am | C | G | Am | Em | × 2\nKażda komórka = 4 pulsy i 4 lekkie uderzenia w dół.\nŁącznie 16 taktów. To ćwiczenie autorskie.\nZnana piosenka i jej film: następny krok „Scena 2”.",
      "criteria": [
        "Zagraj 8-taktowy przykład dwa razy bez pauzy pomiędzy obiegami przy 60 BPM; zapis akordów jest dozwolony.",
        "Zachowaj cztery pulsy na takt i właściwe struny początkowe w Em, Am, C i G."
      ],
      "mistake": "Ten etap nie zastępuje znanej piosenki. Nie oznaczaj utworu w repertuarze jako gotowego tylko dlatego, że umiesz poniższą progresję.",
      "source": "v5-perform"
    },
    {
      "id": "rep-02",
      "source": "v5-rep-02"
    },
    {
      "id": "side-02-1",
      "source": "v5-changes"
    },
    {
      "id": "ch-03-1",
      "source": "v5-theory-12"
    },
    {
      "id": "ch-03-4",
      "source": "v5-riff"
    },
    {
      "id": "ch-03-5",
      "source": "v5-theory-10"
    },
    {
      "id": "ch-03-6",
      "source": "v5-play-ear"
    },
    {
      "id": "ch-03-7",
      "source": "v5-combine"
    },
    {
      "id": "deep-03-1",
      "source": "v5-theory-11"
    },
    {
      "id": "deep-03-3",
      "source": "v5-theory-12"
    },
    {
      "id": "deep-03-4",
      "source": "v5-theory-10"
    },
    {
      "id": "deep-03-6",
      "source": "v5-combine"
    },
    {
      "id": "ch-03-8",
      "source": "v5-combine"
    },
    {
      "id": "rep-03",
      "source": "v5-rep-03"
    },
    {
      "id": "side-03-2",
      "source": "v5-memory"
    },
    {
      "id": "branch-03-1",
      "source": "v5-blues"
    },
    {
      "id": "ch-04-1",
      "source": "v5-theory-20"
    },
    {
      "id": "ch-04-2",
      "source": "v5-fret-notes"
    },
    {
      "id": "ch-04-3",
      "source": "v5-theory-31"
    },
    {
      "id": "ch-04-4",
      "source": "v5-theory-31"
    },
    {
      "id": "ch-04-5",
      "source": "v5-theory-21"
    },
    {
      "id": "ch-04-6",
      "source": "v5-theory-40"
    },
    {
      "id": "ch-04-7",
      "source": "v5-theory-23"
    },
    {
      "id": "deep-04-1",
      "source": "v5-theory-20"
    },
    {
      "id": "deep-04-3",
      "source": "v5-theory-33"
    },
    {
      "id": "deep-04-5",
      "source": "v5-theory-24"
    },
    {
      "id": "deep-04-6",
      "source": "v5-theory-44"
    },
    {
      "id": "ch-04-8",
      "source": "v5-theory-21"
    },
    {
      "id": "rep-04",
      "source": "v5-rep-04"
    },
    {
      "id": "side-04-1",
      "source": "v5-theory-56"
    },
    {
      "id": "side-04-2",
      "source": "v5-theory-31"
    },
    {
      "id": "branch-04-2",
      "source": "v5-theory-31"
    },
    {
      "id": "ch-05-1",
      "source": "v5-pent"
    },
    {
      "id": "ch-05-2",
      "source": "v5-phrasing"
    },
    {
      "id": "ch-05-3",
      "source": "v5-phrasing"
    },
    {
      "id": "ch-05-4",
      "source": "v5-motif"
    },
    {
      "id": "ch-05-5",
      "source": "v5-theory-40"
    },
    {
      "id": "ch-05-7",
      "source": "v5-play-ear"
    },
    {
      "id": "deep-05-1",
      "source": "v5-pent-pair"
    },
    {
      "id": "deep-05-2",
      "source": "v5-phrasing"
    },
    {
      "id": "deep-05-6",
      "source": "v5-memory"
    },
    {
      "id": "ch-05-8",
      "source": "v5-phrasing"
    },
    {
      "id": "rep-05",
      "source": "v5-rep-05"
    },
    {
      "id": "side-05-1",
      "source": "v5-pent-pair"
    },
    {
      "id": "side-05-2",
      "source": "v5-phrasing"
    },
    {
      "id": "branch-05-1",
      "source": "v5-pent-pair"
    },
    {
      "id": "branch-05-3",
      "source": "v5-play-ear"
    },
    {
      "id": "ch-06-6",
      "source": "v5-travis"
    },
    {
      "id": "rep-06",
      "source": "v5-rep-06"
    },
    {
      "id": "side-06-1",
      "source": "v5-travis"
    },
    {
      "id": "branch-06-1",
      "source": "v5-travis"
    },
    {
      "id": "ch-07-3",
      "source": "v5-theory-40"
    },
    {
      "id": "ch-07-4",
      "source": "v5-theory-42"
    },
    {
      "id": "ch-07-5",
      "source": "v5-theory-45"
    },
    {
      "id": "ch-07-6",
      "source": "v5-theory-21"
    },
    {
      "id": "ch-07-7",
      "source": "v5-theory-44"
    },
    {
      "id": "deep-07-6",
      "source": "v5-theory-21"
    },
    {
      "id": "ch-07-8",
      "source": "v5-theory-21"
    },
    {
      "id": "rep-07",
      "source": "v5-rep-07"
    },
    {
      "id": "side-07-1",
      "source": "v5-jazz-changes"
    },
    {
      "id": "side-07-2",
      "source": "v5-bossa"
    },
    {
      "id": "branch-07-2",
      "source": "v5-riff-chords"
    },
    {
      "id": "ch-08-1",
      "source": "v5-theory-22"
    },
    {
      "id": "ch-08-2",
      "source": "v5-pent-positions"
    },
    {
      "id": "ch-08-3",
      "source": "v5-arpeggios"
    },
    {
      "id": "ch-08-4",
      "source": "v5-blues"
    },
    {
      "id": "ch-08-5",
      "source": "v5-arpeggios"
    },
    {
      "id": "ch-08-6",
      "source": "v5-play-ear"
    },
    {
      "id": "ch-08-7",
      "source": "v5-theory-53"
    },
    {
      "id": "deep-08-2",
      "source": "v5-pent-positions"
    },
    {
      "id": "deep-08-3",
      "source": "v5-arpeggios"
    },
    {
      "id": "deep-08-4",
      "source": "v5-thirds"
    },
    {
      "id": "deep-08-5",
      "source": "v5-play-ear"
    },
    {
      "id": "deep-08-6",
      "source": "v5-theory-55"
    },
    {
      "id": "ch-08-8",
      "source": "v5-targets"
    },
    {
      "id": "rep-08",
      "source": "v5-rep-08"
    },
    {
      "id": "side-08-1",
      "source": "v5-blues"
    },
    {
      "id": "side-08-2",
      "source": "v5-play-ear"
    },
    {
      "id": "branch-08-1",
      "source": "v5-jazz-changes"
    },
    {
      "id": "branch-08-2",
      "source": "v5-turnaround"
    },
    {
      "id": "branch-08-3",
      "source": "v5-play-ear"
    },
    {
      "id": "ch-09-1",
      "source": "v5-theory-51"
    },
    {
      "id": "ch-09-2",
      "source": "v5-travis"
    },
    {
      "id": "ch-09-3",
      "source": "v5-theory-45"
    },
    {
      "id": "ch-09-4",
      "source": "v5-modes"
    },
    {
      "id": "ch-09-6",
      "source": "v5-theory-55"
    },
    {
      "id": "ch-09-7",
      "source": "v5-memory"
    },
    {
      "id": "deep-09-3",
      "source": "v5-theory-14"
    },
    {
      "id": "deep-09-5",
      "source": "v5-modes"
    },
    {
      "id": "rep-09",
      "source": "v5-rep-09"
    },
    {
      "id": "side-09-1",
      "source": "v5-jazz-changes"
    },
    {
      "id": "branch-09-1",
      "source": "v5-bossa"
    },
    {
      "id": "branch-09-2",
      "source": "v5-theory-57"
    },
    {
      "id": "ch-10-1",
      "source": "v5-play-ear"
    },
    {
      "id": "ch-10-2",
      "source": "v5-theory-52"
    },
    {
      "id": "ch-10-3",
      "source": "v5-theory-22"
    },
    {
      "id": "ch-10-4",
      "source": "v5-theory-53"
    },
    {
      "id": "ch-10-5",
      "source": "v5-theory-50"
    },
    {
      "id": "ch-10-7",
      "source": "v5-perform"
    },
    {
      "id": "deep-10-1",
      "source": "v5-analysis"
    },
    {
      "id": "deep-10-2",
      "source": "v5-memory"
    },
    {
      "id": "deep-10-4",
      "source": "v5-theory-50"
    },
    {
      "id": "deep-10-5",
      "source": "v5-perform"
    },
    {
      "id": "deep-10-6",
      "source": "v5-practice"
    },
    {
      "id": "rep-10",
      "source": "v5-rep-10"
    },
    {
      "id": "side-10-1",
      "source": "v5-practice"
    },
    {
      "id": "side-10-2",
      "source": "v5-practice"
    }
  ],
  "sources": {
    "v5-theory-10": {
      "title": "musictheory.net · Pięciolinia i klucze",
      "url": "https://www.musictheory.net/lessons/10",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-11": {
      "title": "musictheory.net · Wartości nut",
      "url": "https://www.musictheory.net/lessons/11",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-12": {
      "title": "musictheory.net · Takty i metrum",
      "url": "https://www.musictheory.net/lessons/12",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-13": {
      "title": "musictheory.net · Pauzy",
      "url": "https://www.musictheory.net/lessons/13",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-14": {
      "title": "musictheory.net · Kropki i łuki",
      "url": "https://www.musictheory.net/lessons/14",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-20": {
      "title": "musictheory.net · Półtony, tony i znaki chromatyczne",
      "url": "https://www.musictheory.net/lessons/20",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-21": {
      "title": "musictheory.net · Skala durowa",
      "url": "https://www.musictheory.net/lessons/21",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-22": {
      "title": "musictheory.net · Skale molowe",
      "url": "https://www.musictheory.net/lessons/22",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-23": {
      "title": "musictheory.net · Stopnie skali",
      "url": "https://www.musictheory.net/lessons/23",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-24": {
      "title": "musictheory.net · Znaki przykluczowe",
      "url": "https://www.musictheory.net/lessons/24",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-31": {
      "title": "musictheory.net · Interwały",
      "url": "https://www.musictheory.net/lessons/31",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-33": {
      "title": "musictheory.net · Przewroty interwałów",
      "url": "https://www.musictheory.net/lessons/33",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-40": {
      "title": "musictheory.net · Budowa akordów",
      "url": "https://www.musictheory.net/lessons/40",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-42": {
      "title": "musictheory.net · Przewroty triad",
      "url": "https://www.musictheory.net/lessons/42",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-45": {
      "title": "musictheory.net · Akordy septymowe",
      "url": "https://www.musictheory.net/lessons/45",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-44": {
      "title": "musictheory.net · Analiza funkcji akordów",
      "url": "https://www.musictheory.net/lessons/44",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-50": {
      "title": "musictheory.net · Komponowanie w moll",
      "url": "https://www.musictheory.net/lessons/50",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-51": {
      "title": "musictheory.net · Prowadzenie głosów",
      "url": "https://www.musictheory.net/lessons/51",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-52": {
      "title": "musictheory.net · Analiza utworu O Canada",
      "url": "https://www.musictheory.net/lessons/52",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-53": {
      "title": "musictheory.net · Dźwięki poza akordem",
      "url": "https://www.musictheory.net/lessons/53",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-55": {
      "title": "musictheory.net · Frazy i kadencje",
      "url": "https://www.musictheory.net/lessons/55",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-56": {
      "title": "musictheory.net · Progresje po kole kwint",
      "url": "https://www.musictheory.net/lessons/56",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-theory-57": {
      "title": "musictheory.net · Typowe progresje",
      "url": "https://www.musictheory.net/lessons/57",
      "language": "EN",
      "access": "Bezpłatna lekcja z przykładami; nie wymaga konta"
    },
    "v5-fret-notes": {
      "title": "Bradford Werner · Nazwy dźwięków na gryfie",
      "url": "https://www.thisisclassicalguitar.com/learn-every-note-on-guitar-with-chromatic-scales/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-pulse": {
      "title": "Bradford Werner · Ćwiczenie z metronomem",
      "url": "https://www.thisisclassicalguitar.com/metronome-lesson/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-em": {
      "title": "JustinGuitar · Konkretny chwyt Em",
      "url": "https://www.justinguitar.com/guitar-lessons/the-e-minor-chord-b1-302",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-am": {
      "title": "JustinGuitar · Konkretny chwyt Am",
      "url": "https://www.justinguitar.com/guitar-lessons/the-a-minor-chord-b1-303",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-changes": {
      "title": "JustinGuitar · One Minute Changes — pokaz zmiany chwytów",
      "url": "https://www.youtube.com/watch?v=qXK_If0QzDM",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-cgd": {
      "title": "Nate Savage · Płynne zmiany C, G i D z diagramami",
      "url": "https://www.guitarlessons.com/guitar-lessons/guitar-lessons-for-beginners/changing-guitar-chords-smoothly/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-strum": {
      "title": "Bradford Werner · Ruch kciuka i palców prawej dłoni",
      "url": "https://www.thisisclassicalguitar.com/right-hand-technique-for-classical-guitar/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-strumming": {
      "title": "Nate Savage · Wzory bicia i ciągły ruch dłoni (pokaz kostką; w ćwiczeniu użyj palców)",
      "url": "https://www.guitarlessons.com/guitar-lessons/rhythm-guitar-quick-start-series/essential-strumming-patterns/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-song-form": {
      "title": "Fender · Zwrotka, refren i pozostałe części piosenki",
      "url": "https://www.fender.com/articles/techniques/parts-of-a-song-keep-it-straight",
      "language": "EN",
      "access": "Bezpłatny artykuł; osadzony kurs Fender Play jest opcjonalny"
    },
    "v5-perform": {
      "title": "Bradford Werner · Jak ocenić próbę wykonania",
      "url": "https://www.thisisclassicalguitar.com/using-video-as-a-practice-evaluation-tool/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-memory": {
      "title": "Bradford Werner · Jak zapamiętywać muzykę krótkimi fragmentami",
      "url": "https://www.thisisclassicalguitar.com/lesson-how-to-memorize-music/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-analysis": {
      "title": "Allen Mathews · Analiza przed nauką nowego utworu",
      "url": "https://classicalguitarshed.com/analysis/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-practice": {
      "title": "Allen Mathews · Jak poprawiać konkretne trudne miejsca",
      "url": "https://classicalguitarshed.com/problem-solving-classical-guitar-polishing/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-play-ear": {
      "title": "JustinGuitar · Play What You Hear — usłysz i znajdź na gryfie",
      "url": "https://www.justinguitar.com/guitar-lessons/play-what-you-hear-exercise-et-002",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-phrasing": {
      "title": "Nate Savage · Fraza, pauza, pytanie–odpowiedź (bez obowiązku podciągania strun)",
      "url": "https://www.guitarlessons.com/guitar-lessons/blues-guitar-quick-start-series/blues-phrasing-and-expression/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-motif": {
      "title": "Nate Savage · Powtórzenie motywu w improwizacji",
      "url": "https://www.guitarlessons.com/guitar-lessons/guitar-lessons-for-beginners/key-to-creating-great-blues-solos-lesson-2/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-pent": {
      "title": "Nate Savage · Pentatonika molowa: kształt i prymy",
      "url": "https://www.guitarlessons.com/guitar-lessons/lead-guitar-quick-start-series/the-minor-pentatonic-guitar-scale/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-pent-pair": {
      "title": "Nate Savage · Pentatonika durowa, molowa i skala bluesowa",
      "url": "https://www.guitarlessons.com/guitar-lessons/lead-guitar/5-essential-guitar-scales/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-pent-positions": {
      "title": "Ayla Tesler-Mabe · Łączenie obszarów pentatoniki",
      "url": "https://www.guitarlessons.com/guitar-lessons/guitar-lessons-for-beginners/minor-pentatonic-magic/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-blues": {
      "title": "Nate Savage · Forma dwunastotaktowego bluesa i shuffle",
      "url": "https://www.guitarlessons.com/guitar-lessons/blues-guitar-quick-start-series/the-12-bar-blues-progression/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-targets": {
      "title": "Nate Savage · Wybór dźwięków na zmianę akordu",
      "url": "https://www.guitarlessons.com/guitar-lessons/blues-guitar-quick-start-series/how-to-choose-blues-notes/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-arpeggios": {
      "title": "Dirk Laukens · Arpeggia i dźwięki akordowe w improwizacji",
      "url": "https://www.jazzguitar.be/blog/guitar-arpeggios/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-thirds": {
      "title": "Nate Savage · Mała i wielka tercja nad akordami bluesa",
      "url": "https://www.guitarlessons.com/guitar-lessons/guitar-lessons-for-beginners/breaking-the-blues-scale/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-turnaround": {
      "title": "Nate Savage · Turnaround: zakończenie chorus bluesa",
      "url": "https://www.guitarlessons.com/guitar-lessons/blues-guitar-quick-start-series/turnaround-blues-guitar-licks/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-riff-chords": {
      "title": "Nate Savage · Riff dwudźwiękowy w bluesie",
      "url": "https://www.guitarlessons.com/guitar-lessons/blues-guitar-quick-start-series/the-basic-12-bar-blues-riff/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-travis": {
      "title": "Guitareo · Travis picking w pięciu krokach: bas, melodia, synkopa",
      "url": "https://www.guitarlessons.com/guitar-lessons/guitar-lessons-for-beginners/5-essential-steps-to-learn-travis-picking/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-bossa": {
      "title": "Dirk Laukens · Bossa: bas na pulsie i synkopowane akordy",
      "url": "https://www.jazzguitar.be/blog/blue-bossa-chords/",
      "language": "EN",
      "access": "Bezpłatna lekcja i odsłuch na stronie; pliki do pobrania JGO+ płatne, niewymagane"
    },
    "v5-jazz-changes": {
      "title": "Dirk Laukens · Progresje ii–V–I i dominanta",
      "url": "https://www.jazzguitar.be/blog/jazz-chord-progressions/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-modes": {
      "title": "Dirk Laukens · Tryby: budowa i charakterystyczne dźwięki",
      "url": "https://www.jazzguitar.be/blog/guitar-modes/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-riff": {
      "title": "Marty Music · Seven Nation Army — pokaz pojedynczego riffu",
      "url": "https://www.youtube.com/watch?v=fLCXZs6SWFQ",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-combine": {
      "title": "Bradford Werner · Osobne ćwiczenie melodii i akompaniamentu",
      "url": "https://www.thisisclassicalguitar.com/practicing-hands-separately-on-classical-guitar/",
      "language": "EN",
      "access": "Bezpłatna lekcja; dodatkowe produkty autora są opcjonalne"
    },
    "v5-rep-02": {
      "title": "Przykładowy wybór: Three Little Birds · Marty Music",
      "url": "https://www.youtube.com/watch?v=qCCJ-CVNND4",
      "language": "EN",
      "access": "Bezpłatny film; właściwy materiał zależy od utworu wybranego w scenie"
    },
    "v5-rep-03": {
      "title": "Przykładowy wybór: Stand By Me · JustinGuitar",
      "url": "https://www.youtube.com/watch?v=KlHFye6_Icc",
      "language": "EN",
      "access": "Bezpłatny film; właściwy materiał zależy od utworu wybranego w scenie"
    },
    "v5-rep-04": {
      "title": "Przykładowy wybór: Greensleeves · Bradford Werner",
      "url": "https://www.youtube.com/watch?v=8obTT2lpU4Q",
      "language": "EN",
      "access": "Bezpłatny film; właściwy materiał zależy od utworu wybranego w scenie"
    },
    "v5-rep-05": {
      "title": "Przykładowy wybór: A Horse with No Name — odpowiedzi · Marty Music",
      "url": "https://www.youtube.com/watch?v=qO3yqu96q28",
      "language": "EN",
      "access": "Bezpłatny film; właściwy materiał zależy od utworu wybranego w scenie"
    },
    "v5-rep-06": {
      "title": "Przykładowy wybór: House of the Rising Sun · Marty Music",
      "url": "https://www.youtube.com/watch?v=I2rSsaCPkwM",
      "language": "EN",
      "access": "Bezpłatny film; właściwy materiał zależy od utworu wybranego w scenie"
    },
    "v5-rep-07": {
      "title": "Przykładowy wybór: Let It Be · Marty Music",
      "url": "https://www.youtube.com/watch?v=EYmHjJNlv9s",
      "language": "EN",
      "access": "Bezpłatny film; właściwy materiał zależy od utworu wybranego w scenie"
    },
    "v5-rep-08": {
      "title": "Przykładowy wybór: Autumn Leaves · Charlie Gearon",
      "url": "https://www.youtube.com/watch?v=nnrfjyTaUHQ",
      "language": "EN",
      "access": "Bezpłatny film; właściwy materiał zależy od utworu wybranego w scenie"
    },
    "v5-rep-09": {
      "title": "Przykładowy wybór: Blackbird · Marty Music",
      "url": "https://www.youtube.com/watch?v=oezlSpMQ6d4",
      "language": "EN",
      "access": "Bezpłatny film; właściwy materiał zależy od utworu wybranego w scenie"
    },
    "v5-rep-10": {
      "title": "Przykładowy wybór: Lágrima · Bradford Werner",
      "url": "https://www.youtube.com/watch?v=CrjnGjtozgY",
      "language": "EN",
      "access": "Bezpłatny film; właściwy materiał zależy od utworu wybranego w scenie"
    }
  }
}$patch$::jsonb;
begin
 select version,content into strict latest,previous from public.curriculum_releases order by version desc limit 1;
 if latest<>4 or md5(previous::text)<>'030dff1d110016eddba8ee387e4a3635' then
  raise exception 'Program zmienił się od przeglądu. Porównaj ponownie przed publikacją.';
 end if;
 if exists(select 1 from public.curriculum_draft where id=1 and (base_version<>4 or revision<>10 or content<>previous)) then
  raise exception 'Szkic ma inne zmiany. Nie nadpisano szkicu ani programu.';
 end if;
 next_content:=jsonb_set(previous,'{lessons}',(
  select jsonb_agg(l.value || coalesce((select p from jsonb_array_elements(patch->'lessons') p where p->>'id'=l.value->>'id'),'{}'::jsonb) order by l.ordinality)
  from jsonb_array_elements(previous->'lessons') with ordinality l
 ));
 next_content:=jsonb_set(next_content,'{sources}',(previous->'sources') || (patch->'sources'));
 perform public.validate_curriculum(next_content,previous);
 insert into public.curriculum_releases(version,title,content) values(5,'Feedback: czytelne ćwiczenia i konkretne materiały',next_content);
 update public.curriculum_draft set base_version=5,content=next_content,revision=nextval('public.curriculum_draft_revision_seq'),updated_at=now() where id=1;
end;
$publish$;
commit;
