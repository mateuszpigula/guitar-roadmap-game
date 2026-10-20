# Guitar Quest

Prywatna aplikacja do nauki gitary klasycznej: 10 rozdziałów, 80 zadań głównych i 20 pobocznych, codzienna sesja, powtórki, repertuar i warsztat muzyczny. Interfejs i autorskie instrukcje są po polsku.

## Uruchomienie

Wymagany Node.js 22.12+ (sprawdzono na 24.16) i npm.

```sh
npm install
npm run dev
```

Otwórz adres podany przez Vite, domyślnie `http://127.0.0.1:5173`. Korzystaj stale z tego samego adresu, portu i profilu przeglądarki — IndexedDB jest przypisane do originu. `localhost` i `127.0.0.1` mają osobne dane.

```sh
npm test
npm run build
npm run preview
```

`dist/` zawiera gotową statyczną aplikację. Nie otwieraj pliku HTML przez `file://`; użyj serwera HTTP. Domyślne uruchomienie jest dostępne tylko na tym komputerze. Układ mobilny nie oznacza automatycznej synchronizacji z telefonem. Aby używać własnego telefonu, potrzebny jest dostępny dla niego host; przenieś postęp eksportem/importem. Nic nie jest publikowane przez ten projekt.

## Dane i kopie

- IndexedDB `guitar-quest`, magazyn `state`, klucz `progress`.
- Schemat danych `version: 1`; program `curriculumVersion: 1`.
- `src/storage.ts` definiuje granicę repozytorium (`load`, `save`), którą można zastąpić backendem.
- Eksport/import dostępny w **Twoje postępy**. Import przechodzi walidację i wymaga potwierdzenia zastąpienia obecnego stanu.
- Błąd odczytu nie powoduje automatycznego nadpisania bazy. Błąd zapisu pokazuje komunikat, pozwala wyeksportować stan i ponowić zapis.
- Używaj jednej aktywnej karty do edycji postępu. Synchronizacja wielu kart i urządzeń nie jest częścią tej wersji.
- Czyszczenie danych strony usuwa postęp. Zachowaj kopię JSON przed takim działaniem.

## Zachowanie

XP jest wyliczane z aktualnie zaliczonych zadań (10 za zwykłe, 30 za wyzwanie). Cofnięcie zaliczenia odejmuje te punkty, ale nie usuwa późniejszych zadań. Kolejne kliknięcia nie naliczają duplikatów. Odznaka wymaga wszystkich ośmiu głównych zadań rozdziału; zadania dodatkowe nie blokują trasy.

Pierwsza powtórka przypada po jednym dniu. „Pamiętam” ustawia kolejne odstępy 3, 7, 14 i dalej 14 dni od oceny. „Jeszcze trudne” wraca do jednego dnia. Zaległe zadania pozostają do powtórzenia. Ocena jest własna, aplikacja nie słucha gry przez mikrofon.

Codzienna sesja ma 15, 18 lub 20 minut. Zaznaczenie bloku zapisuje deklarowany czas ćwiczenia, nie pomiar czasu spędzonego w aplikacji. Zadanie zalicza się osobno. Historia zapisuje jeden zestaw bloków na lokalny dzień.

Metronom używa harmonogramu AudioContext, a timer końca odliczania względem zegara. Odsłuch gryfu, akordów i quizów jest syntetyczny. Quizy są ćwiczeniami bieżącej serii; ich wynik nie zmienia XP. Nie jest potrzebny mikrofon, konto ani klucz API.

## Program i źródła

`src/data/curriculum.ts` przechowuje oryginalne treści, trwałe identyfikatory i zależności. `src/data/repertoire.ts` zawiera autorskie ćwiczenia oraz odnośniki do legalnych lekcji popularnych piosenek. Nie kopiowano pełnych tekstów ani tabulatur chronionych utworów.

Struktura korzysta z porównania JustinGuitar, Fender Play, TrueFire, This is Classical Guitar, Classical Guitar Shed i Royal Conservatory. Dodatkowe podstawy teorii: musictheory.net. Źródła zweryfikowano 20 października 2026. Linki opisują język i płatność; część prowadzi do biblioteki/kursu, a część do konkretnej lekcji. Materiały zewnętrzne mogą z czasem zmieniać adresy i zasady dostępu. Własne ćwiczenia pozostają dostępne w aplikacji.

Program ma charakter samodzielnej ścieżki praktycznej. Ostatni rozdział dotyczy samodzielności w repertuarze i improwizacji, nie formalnej kwalifikacji konserwatoryjnej.

## Weryfikacja

Testy Vitest obejmują kompletność i graf zależności programu, XP, odblokowywanie, cofanie, terminy powtórek, walidację importu i repozytorium IndexedDB (fake-indexeddb). Testy ręczne przez agent-browser obejmują pełny przebieg użytkownika, układ desktop/mobile i Web Audio. Wyniki oraz lokalne media: `output/visual-reports/guitar-quest/` (poza Gitem).
