-- Program 4: concrete technique instructions and focused references.
-- Content publication, no schema or progress mutations. Abort if the reviewed
-- release or draft changed; preserve the existing unedited draft with a new revision.
begin;
select pg_advisory_xact_lock(20261021,1);
do $publish$
declare previous jsonb; next_content jsonb; latest integer; patch jsonb := $patch${
  "lessons": [
    {
      "id": "ch-01-1",
      "steps": [
        "Bez grania znajdź najcieńszą strunę przy podłodze — to 1, wysokie E. Najgrubsza przy twarzy to 6, niskie E.",
        "Lewa dłoń nie dociska progów. Prawym kciukiem zagraj po jednym dźwięku: 6–5–4–3–2–1, mówiąc E–A–D–G–B–E. Zostaw 2 sekundy na każdą strunę.",
        "Zagraj z powrotem 1–2–3–4–5–6 i wypowiedz E–B–G–D–A–E. Powtórz oba kierunki 3 razy.",
        "Odwróć wzrok od opisu i wskaż kolejno 3, 1, 5, 2, 6, 4. Dopiero potem sprawdź nazwy w przykładzie. Bez metronomu."
      ],
      "source": "specific-ch-01-1"
    },
    {
      "id": "ch-01-2",
      "theory": "Przed ćwiczeniem sprawdź strój E–A–D–G–B–E. Możesz użyć stroika w Warsztacie albo osobnego tunera. Najpierw sprawdź właściwą strunę i nazwę dźwięku, dopiero potem koryguj napięcie małymi ruchami klucza.",
      "steps": [
        "Otwórz Warsztat → Stroik, włącz mikrofon i wybierz strojoną strunę; możesz też użyć osobnego stroika. Strojenie wykonuj bez grającego metronomu.",
        "Szarp jedną strunę, sprawdź właściwy klucz i obracaj go małymi ruchami.",
        "Nastrój sześć strun, potem sprawdź je ponownie."
      ]
    },
    {
      "id": "ch-01-4",
      "theory": "p–i–m–a to cztery palce dłoni, która szarpie struny: p = kciuk, i = wskazujący, m = środkowy, a = serdeczny. Litery nie oznaczają strun ani progów. Tutaj opisujemy grę prawą dłonią; przy gitarze leworęcznej role dłoni są odwrócone. Lewa dłoń na razie odpoczywa — nie dociskasz żadnego progu. Poznasz jeden ruch i cztery miejsca kontaktu, bez pośpiechu i bez obowiązku używania paznokci.",
      "steps": [
        "Przygotowanie, około 1 minuty: wyłącz metronom. Oprzyj gitarę stabilnie. Przy otworze rezonansowym wskaż strunę 1 (najcieńsze E), 2 (B), 3 (G) i 5 (A). Swobodnie zaokrąglij palce; przedramię ma oparcie na pudle, nadgarstek nie dotyka strun.",
        "Najpierw tylko i: dotknij opuszkiem wskazującego struny 3. Małym ruchem zegnij palec w stronę wnętrza dłoni, aż struna ześlizgnie się z opuszka. Po dźwięku palec kończy ruch nad strunami, bez oparcia na strunie 4. Pozwól mu wrócić blisko miejsca startu. Wykonaj 4 pojedyncze próby z pauzą po każdej. To tirando (free stroke).",
        "Powtórz ten ruch 4 razy palcem m na strunie 2, następnie 4 razy palcem a na strunie 1. Nie ciągnij struny daleko od pudła. Jeżeli trafiasz w dwie struny, zmniejsz ruch i przed każdym dźwiękiem sprawdź miejsce kontaktu. Nie próbuj jeszcze grać płynnie.",
        "Teraz p: dotknij kciukiem struny 5. Przeprowadź go przez strunę w kierunku cieńszych strun, obok palca i. Po szarpnięciu nie odkładaj go na strunie 4. Zagraj 4 razy, odpoczywając między próbami. Kciuk i pozostałe palce nie powinny się zderzać.",
        "Połącz cykl: p na 5 → i na 3 → m na 2 → a na 1. Jeden dźwięk, około sekundy przerwy, następny dźwięk. Po czterech dźwiękach zrób pauzę i rozluźnij dłoń. Powtórz 4 cykle. To cztery kolejne dźwięki, nie jednoczesny akord.",
        "Gdy trafiasz w struny, ustaw 50 BPM i graj jeden dźwięk na klik: p–i–m–a = 1–2–3–4. Zagraj 4 cykle, odpocznij, zagraj kolejne 4. Jeśli klik przeszkadza, wróć do pojedynczych prób bez metronomu; równy ruch jest celem kolejnych sesji."
      ],
      "example": "Kolejność     1       2       3       4\nPrawy palec   p       i       m       a\nStruna       5 (A)   3 (G)   2 (B)   1 (E)\nPróg          0       0       0       0\n\n0 = pusta struna. Każda kolumna to jeden dźwięk.\nTen przydział strun dotyczy ćwiczenia; palce nie są na stałe przypisane do tych strun.",
      "criteria": [
        "Wskaż p, i, m i a na swojej dłoni bez podpowiedzi.",
        "Zagraj 2 serie po 4 cykle p(5)–i(3)–m(2)–a(1), trafiając we właściwe struny; dozwolone są pauzy między cyklami.",
        "Po każdym cyklu potrafisz zatrzymać się i rozluźnić dłoń. Metronom 50 BPM jest próbą dodatkową, nie warunkiem zaliczenia."
      ],
      "mistake": "Jeśli dźwięk brzęczy, najpierw zmniejsz siłę szarpnięcia. Jeśli któryś palec sztywnieje, odłóż całą sekwencję i wykonaj 4 spokojne próby tylko nim. Ruch palca w stronę dłoni nie oznacza zaciskania pięści ani dotykania dłoni po każdym dźwięku.",
      "source": "specific-ch-01-4",
      "minutes": 7
    },
    {
      "id": "ch-01-5",
      "source": "specific-ch-01-5"
    },
    {
      "id": "deep-01-1",
      "steps": [
        "Wyłącz metronom. Na cienkiej strunie 1 dociskaj próg 1 lewym wskazującym (1). Prawym i szarp co około sekundę; palec lewy leży przed metalową listewką, od strony główki.",
        "Zagraj czysty F, następnie stopniowo odpuszczaj nacisk aż do brzęczenia. Dodaj tylko tyle, aby kolejny dźwięk był czysty. To jedna próba, nie wyścig.",
        "Po próbie zdejmij nacisk, odsuń dłoń na 3 sekundy. Zrób 5 prób. Następnie powtórz po 5 na strunie 2/progu 1 i strunie 3/progu 2.",
        "Na koniec zagraj w każdym miejscu po jednym czystym dźwięku bez etapu szukania nacisku. Jeśli nie wychodzi, popraw położenie palca zamiast mocniej ściskać gryf."
      ],
      "source": "specific-deep-01-1"
    },
    {
      "id": "deep-01-2",
      "theory": "Tirando (free stroke) i apoyando (rest stroke) to dwa sposoby zakończenia ruchu szarpiącego palca. W tirando palec przechodzi przez graną strunę i kończy ruch w powietrzu. W apoyando po przejściu przez strunę delikatnie opiera się na sąsiedniej grubszej strunie. Ćwiczymy tylko palce i oraz m na cienkiej strunie 1; zasada dla kciuka wymaga innego kierunku i nie jest celem tej lekcji. Oba sposoby mają zastosowanie — nie chodzi o granie jednego z nich jak najgłośniej.",
      "steps": [
        "Przygotowanie: bez metronomu, bez dociskania progów. Znajdź strunę 1 (cienkie E) i sąsiednią 2 (B). Ustaw prawą dłoń przy otworze rezonansowym. Kciuk może lekko spoczywać na basowej strunie 6, jeśli pomaga ustabilizować dłoń; nie zaciskaj go.",
        "Tirando: dotknij struny 1 palcem i, następnie małym ruchem zegnij palec w kierunku wnętrza dłoni i zwolnij strunę. Zatrzymaj się po dźwięku. Sprawdź wzrokiem: palec i nie dotyka struny 2. Wróć blisko struny 1 i powtórz 4 razy; później 4 razy samym m.",
        "Apoyando: znów zacznij palcem i na strunie 1. Przejdź przez nią w stronę struny 2 i pozwól opuszce delikatnie zatrzymać się na 2. Tylko struna 1 ma zabrzmieć; struny 2 nie szarpiesz. Na moment zostaw palec na 2, żeby sprawdzić pozycję końcową. Zwolnij kontakt i wróć na 1. Zrób 4 próby i, potem 4 próby m.",
        "Porównanie: zagraj 4 razy tirando, zatrzymaj się, następnie 4 razy apoyando. Za każdym razem powiedz „w powietrzu” albo „na strunie 2”. Zrób 2 takie porównania. Nie zmieniaj gwałtownie pozycji nadgarstka i nie wciskaj dłoni w pudło.",
        "Dopiero gdy ruch jest czytelny, ustaw 50 BPM. Na pustej strunie 1 zagraj 8 dźwięków i–m tirando, pauza, 8 dźwięków i–m apoyando. Jeden dźwięk na klik. Jeżeli mylą się palce lub struny, wróć do kroku 2 albo 3 bez kliku.",
        "Na koniec zagraj E–F–G–F na strunie 1: progi 0–1–3–1, lewe palce —–1–3–1. Zrób to raz tirando i raz apoyando, prawymi i–m–i–m. Zostaw tempo dowolne; ten motyw służy zastosowaniu poznanego ruchu."
      ],
      "example": "Grana struna: 1 (cienkie E), próg 0\nTIRANDO:   struna 1 → palec kończy ruch w powietrzu\nAPOYANDO:  struna 1 → palec zatrzymuje się na strunie 2 (B)\n\nSąsiednia grubsza = 2 przy graniu na 1, nie struna 6.\nMelodia na koniec: E  F  G  F\nStruna 1, progi:   0  1  3  1",
      "criteria": [
        "Pokaż po 4 poprawne pojedyncze ruchy tirando i apoyando palcem i, a potem m, bez metronomu.",
        "W tirando palec nie dotyka struny 2; w apoyando spoczywa na niej, ale jej nie szarpie.",
        "Zagraj dwa razy E–F–G–F: raz każdą techniką. Potrafisz nazwać miejsce, w którym kończy się ruch."
      ],
      "mistake": "Jeżeli w apoyando brzmi struna 2, nie zatrzymujesz na niej palca, tylko szarpiesz ją drugi raz. Zwolnij, po pierwszym dźwięku pozostaw opuszek na 2 i sprawdź kontakt. Gdy w tirando stale zahaczasz o 2, obejrzyj pokaz od 2:01 i zmniejsz ruch; nie próbuj nadrabiać siłą.",
      "source": "specific-deep-01-2",
      "minutes": 7
    },
    {
      "id": "deep-01-4",
      "steps": [
        "Bez progów i bez metronomu zagraj na strunie 1 dwa dźwięki: i, potem m. Na strunie 2 też i, m; na strunie 3 też i, m. Każdy palec przechodzi przez graną strunę tirando, bez oparcia na sąsiedniej.",
        "Wracaj: struna 3 (i,m), struna 2 (i,m), struna 1 (i,m). Po całym obiegu zatrzymaj się i rozluźnij dłoń. Wykonaj 4 obiegi.",
        "Ustaw 50 BPM: jeden dźwięk na klik. Zagraj 4 obiegi tą samą drogą. Przejście na inną strunę nie zeruje kolejności i–m.",
        "Wariant na kolejną sesję: na każdej strunie zagraj 3 dźwięki. Kolejne grupy zaczynają się i–m–i, m–i–m, i–m–i. Zrób 2 wolne obiegi, bez wymogu zaliczenia tego wariantu."
      ],
      "example": "Struny: 1 1 | 2 2 | 3 3 | 3 3 | 2 2 | 1 1\nPalce:  i m | i m | i m | i m | i m | i m\nWszędzie próg 0. Jeden znak = jeden dźwięk.",
      "source": "specific-deep-01-4"
    },
    {
      "id": "ch-01-8",
      "source": "specific-ch-01-8"
    },
    {
      "id": "side-01-1",
      "source": "specific-deep-01-1"
    },
    {
      "id": "branch-01-1",
      "source": "specific-branch-01-1"
    },
    {
      "id": "branch-01-3",
      "source": "specific-branch-01-3"
    },
    {
      "id": "deep-02-2",
      "source": "specific-deep-02-2"
    },
    {
      "id": "side-02-2",
      "steps": [
        "Chwyt Em: lewy palec 2 na strunie 5/progu 2, palec 3 na strunie 4/progu 2; pozostałe struny puste. Sprawdź każdą strunę osobno.",
        "Zagraj prawą dłonią p(6)–i(3)–m(2)–a(1), kolejno. Nie używaj bicia. Po cyklu zrób pauzę i sprawdź, czy wybrzmiały cztery dźwięki.",
        "Ustaw 50 BPM. Jeden dźwięk na klik, 4 kliknięcia = 1 takt. Zagraj 8 taktów Em.",
        "Następna próba: Am (X02210), bas na strunie 5. Zagraj p(5)–i(3)–m(2)–a(1) przez 4 takty. Na razie zatrzymaj się przed zmianą chwytu."
      ],
      "source": "specific-side-02-2"
    },
    {
      "id": "branch-02-2",
      "source": "specific-branch-02-2"
    },
    {
      "id": "ch-03-2",
      "source": "specific-branch-01-1"
    },
    {
      "id": "ch-03-3",
      "steps": [
        "Na pustej strunie 1 zagraj i–m–i–m, mówiąc nazwy palców. Zrób 4 grupy bez kliku. Palce po szarpnięciu wracają blisko struny.",
        "Ustaw 50 BPM, metrum 4/4. Graj jeden dźwięk na klik przez 4 takty: i na 1, m na 2, i na 3, m na 4.",
        "Zagraj na strunie 1 progi 0–1–3–1: E–F–G–F, lewe palce —–1–3–1; prawe nadal i–m–i–m. Powtórz 4 razy.",
        "Zrób 20 sekund przerwy. Powtórz sekwencję, zaczynając od m (m–i–m–i). Jeśli palec powtarza się przypadkiem, zatrzymaj się i zagraj daną parę wolniej bez kliku."
      ],
      "source": "specific-branch-01-3"
    },
    {
      "id": "deep-03-5",
      "source": "specific-ch-01-8"
    },
    {
      "id": "side-03-1",
      "source": "specific-side-03-1"
    },
    {
      "id": "deep-04-4",
      "source": "specific-deep-04-4"
    },
    {
      "id": "branch-04-3",
      "source": "specific-branch-04-3"
    },
    {
      "id": "ch-05-6",
      "source": "specific-ch-05-6"
    },
    {
      "id": "deep-05-4",
      "source": "specific-deep-05-4"
    },
    {
      "id": "ch-06-1",
      "steps": [
        "Na Em (022000) ustaw p przy strunie 6, i przy 3, m przy 2, a przy 1. Sprawdź czystość każdej używanej struny bez kliku.",
        "Zagraj p(6)–i(3)–m(2)–a(1), jeden dźwięk na klik przy 50 BPM. Cztery dźwięki tworzą takt 4/4. Zrób 4 takty, pauza, kolejne 4.",
        "Zmień na Am (X02210). Kciuk gra strunę 5, reszta palców nadal 3–2–1. Zrób 4 takty.",
        "Połącz 2 takty Em i 2 takty Am; powtórz taki czterotakt 4 razy. Gdy zmiana chwytu przerywa rytm, ćwicz tylko ostatnie a przed zmianą i pierwsze p po zmianie, bez metronomu."
      ],
      "example": "Em: | p(6) i(3) m(2) a(1) | × 2\nAm: | p(5) i(3) m(2) a(1) | × 2\nCyfry w nawiasach to struny, nie progi.",
      "source": "specific-side-02-2"
    },
    {
      "id": "ch-06-2",
      "steps": [
        "Trzymaj Em. Samym p graj naprzemiennie bas: struna 6 na 1, struna 4 na 3, przy 50 BPM. Na 2 i 4 licz dalej, ale nie graj. Powtórz 4 takty.",
        "Dodaj palec i na pustej strunie 3 na 2 oraz 4: p(6)–i(3)–p(4)–i(3). Zagraj 4 takty.",
        "Zamień ostatnie i na m(2): p(6)–i(3)–p(4)–m(2). Zagraj 4 takty. Kciuk nadal wchodzi wyłącznie na 1 i 3.",
        "Odpocznij 20 sekund i zagraj 8 taktów ostatniego wzoru. Gdy kciuk się spóźnia, wróć na chwilę do samych basów z kroku 1."
      ],
      "example": "Liczenie: 1    2    3    4\nPalec:    p    i    p    m\nStruna:   6    3    4    2\nChwyt: Em przez całe ćwiczenie.",
      "source": "specific-side-02-2"
    },
    {
      "id": "ch-06-3",
      "steps": [
        "Melodia na strunie 1: progi 0–3–1–0, czyli E–G–F–E. Lewa dłoń: —–3–1–—. Prawa: i–m–i–m. Graj ćwierćnuty przy 50 BPM przez 4 takty.",
        "Sam bas: zagraj pustą strunę 6 kciukiem tylko na 1, pozostaw ją przez cały takt. Powtórz 4 takty.",
        "Połącz: na 1 zagraj jednocześnie p(6) i i(1). Na 2, 3, 4 graj tylko kolejne nuty melodii palcami m, i, m. Nie kładź kciuka ponownie na strunie 6 w środku taktu.",
        "Zagraj 4 takty z możliwie cichym basem, pauza, kolejne 4. Jeśli melodia ginie, najpierw ścisz kciuk, zamiast mocniej szarpać wszystkie dźwięki."
      ],
      "example": "Puls:       1     2     3     4\nMelodia:   E(0)  G(3)  F(1)  E(0)  ← struna 1\nBas:       E — — — — — — — — — —   ← pusta 6\nNa 1 oba dźwięki razem, potem tylko melodia.",
      "source": "specific-ch-06-3"
    },
    {
      "id": "ch-06-7",
      "source": "specific-ch-06-3"
    },
    {
      "id": "deep-06-1",
      "source": "specific-side-02-2"
    },
    {
      "id": "deep-06-2",
      "source": "specific-deep-06-2"
    },
    {
      "id": "deep-06-3",
      "steps": [
        "Na pustych strunach ustaw p na 5, i na 3, m na 2, a na 1. Dotknij strun lekko, bez wydobywania dźwięku — to przygotowanie (planting).",
        "Zagraj kolejno p–i–m–a, po 1 dźwięku na klik przy 50 BPM. Następnie zatrzymaj się i ułóż wszystkie palce ponownie. Wykonaj 4 takie cykle z pauzą.",
        "Zagraj kolejne 4 cykle, tym razem przygotowując każdy palec tuż przed jego dźwiękiem. Usłysz, że zbyt wczesne dotknięcie struny skraca jej wybrzmienie.",
        "Porównaj oba sposoby: pierwszym ćwicz trafianie w struny; drugim próbuj płynnej sekwencji. Wykonaj po 4 cykle każdego i zapisz, który był dziś łatwiejszy."
      ],
      "source": "specific-deep-06-3"
    },
    {
      "id": "deep-06-4",
      "source": "specific-ch-05-6"
    },
    {
      "id": "deep-06-5",
      "source": "specific-deep-06-5"
    },
    {
      "id": "ch-06-8",
      "source": "specific-ch-06-3"
    },
    {
      "id": "side-06-2",
      "source": "specific-side-06-2"
    },
    {
      "id": "branch-06-1",
      "source": "specific-side-02-2"
    },
    {
      "id": "branch-06-2",
      "source": "specific-side-06-2"
    },
    {
      "id": "branch-06-3",
      "source": "specific-branch-06-3"
    },
    {
      "id": "deep-08-2",
      "source": "specific-deep-05-4"
    },
    {
      "id": "ch-09-5",
      "source": "specific-ch-06-3"
    },
    {
      "id": "ch-09-8",
      "source": "specific-ch-06-3"
    },
    {
      "id": "side-09-2",
      "source": "specific-ch-06-3"
    },
    {
      "id": "branch-09-3",
      "source": "specific-side-06-2"
    },
    {
      "id": "ch-10-6",
      "source": "specific-ch-10-6"
    },
    {
      "id": "ch-10-8",
      "source": "specific-ch-10-8"
    }
  ],
  "sources": {
    "specific-ch-01-1": {
      "title": "Bradford Werner · Nazwy pustych strun i strojenie",
      "url": "https://www.thisisclassicalguitar.com/tuning-the-classical-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-ch-01-4": {
      "title": "Bradford Werner · Ruch palców prawej dłoni · film: palce od 10:56, kciuk od 14:06",
      "url": "https://www.thisisclassicalguitar.com/right-hand-technique-for-classical-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-ch-01-5": {
      "title": "Bradford Werner · Ustawienie lewej dłoni i palców przy progach",
      "url": "https://www.thisisclassicalguitar.com/left-hand-technique-and-position/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-deep-01-1": {
      "title": "Bradford Werner · Nacisk, odpuszczanie i rozluźnianie lewej dłoni",
      "url": "https://www.thisisclassicalguitar.com/lesson-left-hand-tension-relaxation-exercises-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-deep-01-2": {
      "title": "Bradford Werner · Tirando i apoyando · pokaz ruchu od 2:01",
      "url": "https://www.thisisclassicalguitar.com/lesson-rest-free-stroke-on-classical-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-deep-01-4": {
      "title": "Bradford Werner · Przechodzenie między strunami naprzemiennymi palcami",
      "url": "https://www.thisisclassicalguitar.com/beginner-string-crossing-exercise-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-ch-01-8": {
      "title": "Bradford Werner · Jak ćwiczyć z metronomem",
      "url": "https://www.thisisclassicalguitar.com/metronome-lesson/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-branch-01-1": {
      "title": "Bradford Werner · Kontrola barwy i miejsca szarpnięcia",
      "url": "https://www.thisisclassicalguitar.com/how-to-get-a-beautiful-tone/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-branch-01-3": {
      "title": "Bradford Werner · Palcowanie i naprzemienność prawej dłoni",
      "url": "https://www.thisisclassicalguitar.com/beginner-lesson-alternating-right-hand-fingers/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-deep-02-2": {
      "title": "Bradford Werner · Przygotowanie lewej dłoni do następnego dźwięku",
      "url": "https://www.thisisclassicalguitar.com/lesson-left-hand-preparation-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-side-02-2": {
      "title": "Bradford Werner · Arpeggia, równowaga palców i przygotowanie",
      "url": "https://www.thisisclassicalguitar.com/beginner-arpeggio-exercises-lesson-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-branch-02-2": {
      "title": "Bradford Werner · Ruch kciuka i pozycja prawej dłoni · od 14:06",
      "url": "https://www.thisisclassicalguitar.com/right-hand-technique-for-classical-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-side-03-1": {
      "title": "Bradford Werner · Metrum 3/4 i wartości rytmiczne",
      "url": "https://www.thisisclassicalguitar.com/3-4-time-signatures-dotted-half-notes/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-deep-04-4": {
      "title": "Bradford Werner · Dźwięki gryfu i te same wysokości na różnych strunach",
      "url": "https://www.thisisclassicalguitar.com/learn-every-note-on-guitar-with-chromatic-scales/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-branch-04-3": {
      "title": "Bradford Werner · Czytanie nut bez zatrzymywania pulsu",
      "url": "https://www.thisisclassicalguitar.com/sight-reading-music-on-classical-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-ch-05-6": {
      "title": "Bradford Werner · Łączenie i podtrzymywanie dźwięków: legato",
      "url": "https://www.thisisclassicalguitar.com/how-to-play-legato-on-classical-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-deep-05-4": {
      "title": "Bradford Werner · Zmiany pozycji i kontrola szumu strun",
      "url": "https://www.thisisclassicalguitar.com/lesson-shifts-string-noise-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-ch-06-3": {
      "title": "Bradford Werner · Praca nad głosami osobno przed ich połączeniem",
      "url": "https://www.thisisclassicalguitar.com/practicing-hands-separately-on-classical-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-deep-06-2": {
      "title": "Bradford Werner · Małe barré i rozkład nacisku",
      "url": "https://www.thisisclassicalguitar.com/barre-lessons-and-exercises-for-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-deep-06-3": {
      "title": "Bradford Werner · Przygotowanie palców prawej dłoni (planting)",
      "url": "https://www.thisisclassicalguitar.com/lesson-right-hand-planting-preparation/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-deep-06-5": {
      "title": "Bradford Werner · Legato lewej dłoni: hammer-on i pull-off",
      "url": "https://www.thisisclassicalguitar.com/lesson-slurs-for-classical-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-side-06-2": {
      "title": "Bradford Werner · Naturalne i sztuczne flażolety: pokaz na gitarze",
      "url": "https://www.thisisclassicalguitar.com/lesson-harmonics-classical-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-branch-06-3": {
      "title": "Bradford Werner · Pierwsze ćwiczenie tremolo",
      "url": "https://www.thisisclassicalguitar.com/beginner-tremolo-exercise-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-ch-10-6": {
      "title": "Bradford Werner · Artykulacja: legato, staccato i akordy",
      "url": "https://www.thisisclassicalguitar.com/right-hand-articulation-classical-guitar/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    },
    "specific-ch-10-8": {
      "title": "Bradford Werner · Jak ocenić swój występ na nagraniu",
      "url": "https://www.thisisclassicalguitar.com/using-video-as-a-practice-evaluation-tool/",
      "language": "EN",
      "access": "Bezpłatny materiał na stronie; ewentualna książka jest opcjonalna"
    }
  }
}$patch$::jsonb;
begin
 select version,content into strict latest,previous from public.curriculum_releases order by version desc limit 1;
 if latest<>3 or md5(previous::text)<>'9c1ce98e53305223c34d2a9bc5264b25' then
  raise exception 'Program zmienił się od przeglądu. Porównaj ponownie przed publikacją.';
 end if;
 if exists(select 1 from public.curriculum_draft where id=1 and (base_version<>3 or revision<>8 or content<>previous)) then
  raise exception 'Szkic ma inne zmiany. Nie nadpisano szkicu ani programu.';
 end if;
 next_content:=jsonb_set(previous,'{lessons}',(
  select jsonb_agg(l.value || coalesce((select p from jsonb_array_elements(patch->'lessons') p where p->>'id'=l.value->>'id'),'{}'::jsonb) order by l.ordinality)
  from jsonb_array_elements(previous->'lessons') with ordinality l
 ));
 next_content:=jsonb_set(next_content,'{sources}',(previous->'sources') || (patch->'sources'));
 perform public.validate_curriculum(next_content,previous);
 insert into public.curriculum_releases(version,title,content) values(4,'Konkretnie: palce, ruch, arpeggia i źródła',next_content);
 update public.curriculum_draft set base_version=4,content=next_content,revision=nextval('public.curriculum_draft_revision_seq'),updated_at=now() where id=1;
end;
$publish$;
commit;
