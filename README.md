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

`dist/` zawiera gotową statyczną aplikację. Nie otwieraj pliku HTML przez `file://`; użyj serwera HTTP. Domyślne uruchomienie jest dostępne tylko na tym komputerze. Wdrożenie: https://guitar-roadmap-game.vercel.app. Po zalogowaniu tym samym kontem telefon i komputer synchronizują postęp. Bez konfiguracji Supabase działa tryb lokalny.

## Dane i kopie

- IndexedDB `guitar-quest`, magazyn `state`, klucz `progress`.
- Schemat danych `version: 1`; program `curriculumVersion: 1`.
- `src/storage.ts` definiuje granicę repozytorium (`load`, `save`), którą można zastąpić backendem.
- Eksport/import dostępny w **Twoje postępy**. Import przechodzi walidację i wymaga potwierdzenia zastąpienia obecnego stanu.
- Błąd odczytu nie powoduje automatycznego nadpisania bazy. Błąd zapisu pokazuje komunikat, pozwala wyeksportować stan i ponowić zapis.
- Konta mają osobne kopie offline w IndexedDB `guitar-quest-accounts`. Synchronizacja działa po zmianie (700 ms), co 12 sekund oraz po odzyskaniu połączenia i powrocie do karty. Web Locks serializują operacje kart tego samego konta w obsługiwanych przeglądarkach.
- Czyszczenie danych strony usuwa lokalną kopię i niewysłane zmiany. Zsynchronizowany postęp wróci po zalogowaniu. Zachowaj eksport przed czyszczeniem danych.

## Zachowanie

XP jest wyliczane z aktualnie zaliczonych zadań (10 za zwykłe, 30 za wyzwanie). Cofnięcie zaliczenia odejmuje te punkty, ale nie usuwa późniejszych zadań. Kolejne kliknięcia nie naliczają duplikatów. Odznaka wymaga wszystkich ośmiu głównych zadań rozdziału; zadania dodatkowe nie blokują trasy.

Pierwsza powtórka przypada po jednym dniu. „Pamiętam” ustawia kolejne odstępy 3, 7, 14 i dalej 14 dni od oceny. „Jeszcze trudne” wraca do jednego dnia. Zaległe zadania pozostają do powtórzenia. Ocena jest własna, aplikacja nie słucha gry przez mikrofon.

Codzienna sesja ma 15, 18 lub 20 minut. Zaznaczenie bloku zapisuje deklarowany czas ćwiczenia, nie pomiar czasu spędzonego w aplikacji. Zadanie zalicza się osobno. Historia zapisuje jeden zestaw bloków na lokalny dzień.

Metronom używa harmonogramu AudioContext, a timer końca odliczania względem zegara. Odsłuch gryfu, akordów i quizów jest syntetyczny. Quizy są ćwiczeniami bieżącej serii; ich wynik nie zmienia XP. Nie jest potrzebny mikrofon. Konto jest wymagane tylko do synchronizacji.

## Program i źródła

`src/data/curriculum.ts` przechowuje oryginalne treści, trwałe identyfikatory i zależności. `src/data/repertoire.ts` zawiera autorskie ćwiczenia oraz odnośniki do legalnych lekcji popularnych piosenek. Nie kopiowano pełnych tekstów ani tabulatur chronionych utworów.

Struktura korzysta z porównania JustinGuitar, Fender Play, TrueFire, This is Classical Guitar, Classical Guitar Shed i Royal Conservatory. Dodatkowe podstawy teorii: musictheory.net. Źródła zweryfikowano 20 października 2026. Linki opisują język i płatność; część prowadzi do biblioteki/kursu, a część do konkretnej lekcji. Materiały zewnętrzne mogą z czasem zmieniać adresy i zasady dostępu. Własne ćwiczenia pozostają dostępne w aplikacji.

Program ma charakter samodzielnej ścieżki praktycznej. Ostatni rozdział dotyczy samodzielności w repertuarze i improwizacji, nie formalnej kwalifikacji konserwatoryjnej.

## Weryfikacja

Testy Vitest obejmują kompletność i graf zależności programu, XP, odblokowywanie, cofanie, terminy powtórek, walidację importu i repozytorium IndexedDB (fake-indexeddb). Testy ręczne przez agent-browser obejmują pełny przebieg użytkownika, układ desktop/mobile i Web Audio. Wyniki oraz lokalne media: `output/visual-reports/guitar-quest/` (poza Gitem).

## Konto i synchronizacja

1. Na stronie produkcyjnej wybierz **Zaloguj → Pierwszy raz? Utwórz konto**. Potwierdź e-mail i zaloguj się hasłem na obu urządzeniach.
2. Stary zapis z localhost można przenieść, logując się na konto w lokalnej aplikacji i wybierając **Przenieś postęp z trybu lokalnego**. Alternatywnie wyeksportuj JSON z localhost, a na stronie produkcyjnej zaimportuj go po zalogowaniu. Import zastępuje stan konta i synchronizuje się.
3. Nie trzeba eksportować danych przy kolejnych zmianach urządzenia. Poczekaj na **Zsynchronizowano**.

Supabase: projekt `wlgixxrgkmzopwsacffq`, tabela `public.guitar_progress`, RLS ogranicza odczyt/zapis do `auth.uid()`. Funkcja `save_guitar_progress` porównuje rewizję w jednej transakcji. Klient łączy zmiany względem ostatniego wspólnego stanu; status zadania i terminy powtórek stanowią jeden element. Różne notatki tego samego zadania i konkurencyjne zmiany jednej sesji wywołują wybór użytkownika. Obie wersje można pobrać. Nigdy nie wybieramy po prostu całej „ostatniej” kopii.

Kopia offline i ostatni wspólny stan zapisują się razem. Wylogowanie zachowuje osobną kopię konta; nie przenosi jej do trybu anonimowego. Kopia trybu lokalnego nie jest automatycznie wysyłana przy logowaniu. Dla prywatności na współdzielonym komputerze po synchronizacji i wylogowaniu można usunąć dane strony.

Service worker w buildzie produkcyjnym zapisuje wyłącznie publiczne pliki aplikacji. Po pierwszym otwarciu online można ponownie otwierać aplikację bez internetu; zalogowanie i odświeżenie wygasłej sesji wymagają połączenia. Żądania Supabase nie są cache'owane przez service workera.

### Konfiguracja

Publiczne zmienne klienta (w `.env.local` i Vercelu):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (publishable lub legacy anon; nigdy service_role)

`scripts/configure-cloud.mjs --vercel` używa zalogowanych CLI do zapisania publicznej konfiguracji bez wypisywania kluczy. Migracja bazy: `supabase/migrations/202610200001_progress_sync.sql` (wykonana jednokrotnie przez `supabase db query --linked --project-ref … -f …`). Adresy powrotu i długość hasła są w `supabase/config.toml`. Weryfikacja e-mail pozostaje włączona.

Wysyłka potwierdzeń/resetu korzysta obecnie z domyślnej poczty Supabase: jest ograniczona do adresów członków organizacji i ma niski limit. Dla prywatnego właściciela użyj adresu swojego konta Supabase. Przed udostępnianiem aplikacji innym osobom skonfiguruj własny SMTP: https://supabase.com/docs/guides/auth/auth-smtp. Zwykłe logowanie hasłem nie wysyła e-maili.

### Cloudflare Turnstile

Formularze obsługują Cloudflare Turnstile. Konfiguracja środowiska wymaga publicznego klucza widgetu i włączenia CAPTCHA w Supabase. Sama obecność widgetu nie zabezpiecza API.

1. Utwórz widget Turnstile (Managed) dla `guitar-roadmap-game.vercel.app`. Dla pracy lokalnej dodaj osobno `localhost` i `127.0.0.1` lub użyj osobnego widgetu deweloperskiego.
2. Publiczny Site Key ustaw jako `VITE_TURNSTILE_SITE_KEY` w `.env.local` oraz w środowisku Production na Vercelu. Zbuduj i wdroż aplikację, sprawdź działanie widgetu.
3. Secret Key wpisz wyłącznie w Supabase → Authentication → Bot and Abuse Protection → CAPTCHA, wybierając Turnstile. Włącz ochronę. Sekretu nie wolno umieszczać w zmiennych `VITE_*`, repozytorium ani buildzie.
4. Sprawdź odrzucenie żądań logowania/rejestracji/resetu bez tokenu oraz z nieprawidłowym tokenem. Sprawdź prawidłowe logowanie w przeglądarce. Stare otwarte karty aplikacji mogą wymagać zamknięcia i ponownego otwarcia, aby otrzymać nowy formularz.

Formularze przekazują `captchaToken` do Supabase, blokują wysłanie bez weryfikacji oraz odnawiają widget po próbie i zmianie formularza. Wygaśnięcie/błąd unieważnia token. Zmiana hasła przez już uwierzytelniony link odzyskiwania nie wymaga widgetu. Skrypt Cloudflare ładuje się tylko przy formularzu i nie trafia do cache service workera.

Lokalny podgląd widgetu: `VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA npm run dev -- --port 5174`. To oficjalny klucz testowy, który **nie zapewnia ochrony** i nie może trafić do produkcji. Testy formularzy używają atrap SDK; nie dowodzą włączenia walidacji w Supabase. Po włączeniu CAPTCHA dawny `verify-cloud.mjs` nie przetestuje zwykłego logowania bez prawdziwego tokenu — nie wyłączaj ochrony dla tego skryptu.

### Testy synchronizacji

`npm test` obejmuje merge, konflikty, cofnięcia, odtwarzanie kolejki offline, izolację cache kont, niedostępny zapis i edycję podczas synchronizacji. `node scripts/verify-cloud.mjs` tworzy dwa tymczasowe konta i sprawdza prawdziwe RLS, logowanie, dostęp anonimowy oraz równoczesne zapisy. Po testach uruchom `node scripts/verify-cloud.mjs --cleanup`; nie publikuj pliku `output/.cloud-test-users.json`. Skrypt wymaga zalogowanego CLI Supabase i jest przeznaczony dla właściciela projektu.

## Program nauki w Supabase i edytor

Opublikowany program jest przechowywany w `public.curriculum_releases` jako kompletna, niezmienna wersja JSON: rozdziały, lekcje, repertuar i źródła. Jedna publikacja zmienia cały program atomowo. Postęp pozostaje osobno w `guitar_progress`; jego format i dane nie są przepisywane przez publikowanie.

- `curriculum_editors`: uprawnienia redakcyjne, nadawane przez administratora bazy. Zwykłe konto nie może nadać sobie tej roli.
- `curriculum_draft`: jeden wspólny szkic z numerem rewizji, zabezpieczony przed równoczesnym nadpisaniem.
- `start_curriculum_draft`, `save_curriculum_draft`, `publish_curriculum_draft`: operacje sprawdzające uprawnienia po stronie bazy. Aplikacja używa wyłącznie publicznego klucza i sesji użytkownika.
- `src/content/schema.json`: schemat opublikowanej treści, sprawdzany przez Ajv w aplikacji oraz pg_jsonschema w PostgreSQL. Szkic może zawierać puste pola tekstowe; publikacja wymaga pełnej treści. Semantyczna walidacja dodatkowo sprawdza graf wymagań, odnośniki między rekordami i zgodność z historią.

### Edytowanie

Zaloguj się na konto właściciela i wybierz **Edytor programu** (na telefonie: **Twoje postępy → Otwórz edytor programu**). Bezpośredni adres: `/#editor`.

1. Utwórz szkic lub otwórz istniejący. Wybierz lekcje, utwory, rozdziały albo źródła.
2. Edytuj pola, dodawaj nowe elementy, zmieniaj kolejność i wymagania. Nieopublikowany element można usunąć ze szkicu. Nowy rozdział wymaga przynajmniej jednego zadania głównego.
3. Zapisz szkic. Nie ma automatycznego zapisu formularza; przy opuszczaniu niezapisanych zmian aplikacja ostrzega. Kopię szkicu można pobrać jako JSON.
4. Otwórz podgląd, sprawdź kryteria i materiały. Walidacja adresów nie zastępuje obejrzenia filmu.
5. Wybierz **Sprawdź i opublikuj**, przeczytaj podsumowanie, a następnie potwierdź publikację.

Program jest odświeżany przy ponownym otwarciu aplikacji. Nowa publikacja nie podmienia treści w trakcie ćwiczenia. W zakładce postępu można sprawdzić dostępność aktualizacji. Każda opublikowana wersja pozostaje w historii bazy (panel pokazuje ostatnie 20).

Opublikowanych identyfikatorów nie usuwamy ani nie zmieniamy ich rozdziału, rodzaju lub wartości XP. Historyczne opcje scen również pozostają dostępne. Przy całkowicie nowej umiejętności dodaj nowe zadanie. Zmiana opisu istniejącego zadania zachowuje zaliczenie; nie oznacza ponownej oceny umiejętności ucznia.

### Offline i zgodność wersji

Aplikacja przed otwarciem postępu pobiera najnowszą poprawną wersję i zapisuje ją w osobnej bazie IndexedDB `guitar-quest-curriculum`. Jeśli sieć jest niedostępna, korzysta z zapisanej kopii; przy pierwszym uruchomieniu bez kopii ma program v2 dołączony do aplikacji. Brak możliwości zapisu offline jest komunikowany. Pliki aplikacji buforuje service worker; żądania Supabase nie są buforowane przez service worker.

Postęp z nowszej wersji programu zachowuje nieznane starszemu urządzeniu zadania i utwory. Ekran prosi wtedy o aktualizację; lokalnie nieznane lekcje nie są jeszcze wliczane do wyświetlanego XP. Import, eksport i synchronizacja nie usuwają tych rekordów. Przy pierwszym wdrożeniu tej funkcji należy odświeżyć starsze, otwarte karty aplikacji.

### Migracje i weryfikacja

Migracje są w `supabase/migrations`. Zastosowane migracje są niezmienne; kolejne poprawki dodajemy jako nowe pliki. Migracje z 21 października 2026 zastosowano przez zalogowany SQL Editor i zapisano w `supabase_migrations.schema_migrations`, ponieważ CLI nie miało aktywnego uwierzytelnienia. Tabela historii również ma RLS; nie jest udostępniona klientom aplikacji.

Po zalogowaniu CLI i podłączeniu właściwego projektu standardowy workflow to `supabase migration new`, testy i `supabase db push`. Nie uruchamiaj ponownie zastosowanych plików ręcznie. Zmiana treści programu odbywa się w edytorze; nie wymaga migracji SQL ani deployu frontendu.

`supabase/tests/curriculum.sql` sprawdza rzeczywiste role i RPC w transakcji zakończonej `ROLLBACK`: odczyt publiczny, brak uprawnień gościa i zwykłego konta, dostęp edytora, konflikty rewizji, niedozwolone adresy, pętle, zachowanie XP i atomową publikację. Wymaga uruchomienia przez administratora bazy oraz przynajmniej jednego wpisu w `curriculum_editors`. `npm test` obejmuje także cache, kompatybilność kopii i formularz redakcyjny.
