# Feedback review — curriculum v5 (2026-10-24)

Five new reports: clarify memory expectations in Scene 1; show Em/Am and C/G/D diagrams next to exercises; provide a complete verse/chorus example; replace course indexes with focused references. Seven older reports were checked against the fixes already published in v3/v4.

## Changes

- Five rewritten lessons; 125 changed lesson records overall, chiefly source assignments. All 200 IDs, prerequisites, XP, challenge flags, song choices and existing song records remain unchanged.
- Finger-number diagrams in 17 early chord/arpeggio lessons, shared with the workshop.
- Scene material follows the selected song instead of a generic/default link.
- Optional admin response field, owner-visible and exported, protected by editor authorization and optimistic revision checks. The original status-only RPC remains compatible and preserves comments.
- Guarded v5 publication checks release v4 hash and draft revision 10 before updating the unchanged draft. No progress-table mutations.

## Validation

- 213 Vitest tests; TypeScript and production build.
- Database tests in a rolled-back transaction: RLS, two-account isolation, anonymous denial, owner denial of admin comments, stale writes, comment bounds, older-client status changes and complete export of 1006+ entries.
- Anonymous production REST call confirms the new RPC exists and denies access.
- Local agent-browser: chord diagrams at mobile/desktop widths, light/dark themes, worked song form, song-specific links. Admin response presentation checked using explicitly marked fixture data; authenticated UI saving is covered by transport/component and database tests, not claimed as a browser end-to-end test.

## Reference audit

All 200 lesson-to-source assignments reviewed. 101 unique URLs including repertoire; 93 HTTP 200, with YouTube titles checked through its oEmbed endpoint. Eight sites return anti-bot HTTP 403 to curl; their exact article/lesson addresses were corroborated through official pages/search. No attempt to bypass challenges. Availability checks do not mean every entire video was watched.

| URL | HTTP | Title |
|---|---|---|
| https://www.thisisclassicalguitar.com/tuning-the-classical-guitar/ | 200 | Tuning the Classical Guitar / This is Classical Guitar |
| https://www.thisisclassicalguitar.com/basic-posture-and-sitting-position-guitar/ | 200 | Lesson: Sitting and Guitar Position for Classical Guitar / This is Classical Guitar |
| https://www.thisisclassicalguitar.com/right-hand-technique-for-classical-guitar/ | 200 | Right Hand Position and Technique Lesson for Classical Guitar / This is Classical Guitar |
| https://www.thisisclassicalguitar.com/left-hand-technique-and-position/ | 200 | Lesson: Left Hand Technique for Classical Guitar / This is Classical Guitar |
| https://www.thisisclassicalguitar.com/metronome-lesson/ | 200 | How to Play with a Metronome – 10 Step Lesson / This is Classical Guitar |
| https://www.youtube.com/watch?v=4-JTCASlh-w | 200 | How To Read TAB and Chord Boxes (Guitar Lesson BC-108) Guitar for beginners, Getting started |
| https://www.thisisclassicalguitar.com/lesson-left-hand-tension-relaxation-exercises-guitar/ | 200 | Left Hand Tension and Relaxation Lesson and Exercises / This is Classical Guitar |
| https://www.thisisclassicalguitar.com/lesson-rest-free-stroke-on-classical-guitar/ | 200 | Q&amp;A Lesson: Rest and Free Stroke on Classical Guitar / This is Classical Guitar |
| https://www.musictheory.net/lessons/12 | 200 | musictheory.net |
| https://www.thisisclassicalguitar.com/beginner-string-crossing-exercise-guitar/ | 200 | Beginner String Crossing Exercises for Classical Guitar / This is Classical Guitar |
| https://www.musictheory.net/lessons/13 | 200 | musictheory.net |
| https://www.thisisclassicalguitar.com/lesson-how-to-memorize-music/ | 200 | Lesson: How to Memorize Music / This is Classical Guitar |
| https://www.justinguitar.com/guitar-lessons/play-what-you-hear-exercise-et-002 | 403 | Just a moment... |
| https://www.thisisclassicalguitar.com/how-to-get-a-beautiful-tone/ | 200 | How do I get a beautiful right hand tone on classical guitar? / This is Classical Guitar |
| https://www.thisisclassicalguitar.com/beginner-lesson-alternating-right-hand-fingers/ | 200 | Lesson: Alternating Right Hand Fingers for Classical Guitar / This is Classical Guitar |
| https://www.justinguitar.com/guitar-lessons/the-e-minor-chord-b1-302 | 403 | Just a moment... |
| https://www.justinguitar.com/guitar-lessons/the-a-minor-chord-b1-303 | 403 | Just a moment... |
| https://www.youtube.com/watch?v=qXK_If0QzDM | 200 | One Minute Changes (Guitar Lesson BC-115) Guitar for beginners Stage 1 |
| https://www.guitarlessons.com/guitar-lessons/guitar-lessons-for-beginners/changing-guitar-chords-smoothly/ | 200 |  Changing Guitar Chords Smoothly - Free Guitar Lesson  |
| https://www.musictheory.net/lessons/11 | 200 | musictheory.net |
| https://www.guitarlessons.com/guitar-lessons/rhythm-guitar-quick-start-series/essential-strumming-patterns/ | 200 |  Essential Strumming Patterns - Rhythm Guitar Lessons  |
| https://www.musictheory.net/lessons/40 | 200 | musictheory.net |
| https://www.youtube.com/watch?v=VC2t7fhujXs | 200 | Every Guitar Chord You Need to Learn |
| https://www.thisisclassicalguitar.com/lesson-left-hand-preparation-guitar/ | 200 | Lesson: Left Hand Preparation for Classical Guitar / This is Classical Guitar |
| https://www.fender.com/articles/techniques/parts-of-a-song-keep-it-straight | 403 | Just a moment... |
| https://www.thisisclassicalguitar.com/using-video-as-a-practice-evaluation-tool/ | 200 | Using Video as a Practice Evaluation Tool / This is Classical Guitar |
| https://www.youtube.com/watch?v=qCCJ-CVNND4 | 200 | Bob Marley - (3) Three Little Birds - How to Play on Acoustic Guitar - Easy songs for acoustic |
| https://www.thisisclassicalguitar.com/beginner-arpeggio-exercises-lesson-guitar/ | 200 | Beginner Arpeggio Lesson for Classical Guitar / This is Classical Guitar |
| https://www.musictheory.net/lessons/45 | 200 | musictheory.net |
| https://www.youtube.com/watch?v=fLCXZs6SWFQ | 200 | Learn Seven Nation Army The White Stripes Guitar Lesson + Tutorial |
| https://www.musictheory.net/lessons/10 | 200 | musictheory.net |
| https://www.thisisclassicalguitar.com/practicing-hands-separately-on-classical-guitar/ | 200 | Practicing Hands Separately on Classical Guitar / This is Classical Guitar |
| https://www.musictheory.net/lessons/15 | 200 | musictheory.net |
| https://www.youtube.com/watch?v=KlHFye6_Icc | 200 | Stand By Me Easy Guitar Lesson / Ben E. King |
| https://www.thisisclassicalguitar.com/3-4-time-signatures-dotted-half-notes/ | 200 | 3/4 Time Signatures and Dotted Half Notes / This is Classical Guitar |
| https://www.guitarlessons.com/guitar-lessons/blues-guitar-quick-start-series/the-12-bar-blues-progression/ | 200 |  The 12-Bar Blues Progression - Blues Guitar Lessons  |
| https://www.musictheory.net/lessons/20 | 200 | musictheory.net |
| https://www.thisisclassicalguitar.com/learn-every-note-on-guitar-with-chromatic-scales/ | 200 | Learn Every Note on Guitar with Chromatic Scales / This is Classical Guitar |
| https://www.musictheory.net/lessons/31 | 200 | musictheory.net |
| https://www.musictheory.net/lessons/21 | 200 | musictheory.net |
| https://www.musictheory.net/lessons/23 | 200 | musictheory.net |
| https://www.musictheory.net/lessons/33 | 200 | musictheory.net |
| https://www.musictheory.net/lessons/24 | 200 | musictheory.net |
| https://www.musictheory.net/lessons/44 | 200 | musictheory.net |
| https://www.youtube.com/watch?v=8obTT2lpU4Q | 200 | Free PDF Method Lesson: Leyenda Theme, Chromatic Scale, & Greensleeves for Beginner Guitar |
| https://www.musictheory.net/lessons/56 | 200 | musictheory.net |
| https://www.musictheory.net/lessons/42 | 200 | musictheory.net |
| https://www.thisisclassicalguitar.com/sight-reading-music-on-classical-guitar/ | 200 | Sight Reading Music on Classical Guitar / This is Classical Guitar |
| https://www.guitarlessons.com/guitar-lessons/lead-guitar-quick-start-series/the-minor-pentatonic-guitar-scale/ | 200 |  The Minor Pentatonic Scale - Lead Guitar Lessons  |
| https://www.guitarlessons.com/guitar-lessons/blues-guitar-quick-start-series/blues-phrasing-and-expression/ | 200 |  Blues Phrasing and Expression - Blues Guitar Lessons  |
| https://www.guitarlessons.com/guitar-lessons/guitar-lessons-for-beginners/key-to-creating-great-blues-solos-lesson-2/ | 200 |  The KEY to Creating Great Blues Solos (Blues Solo Guitar Lesson #1)  |
| https://www.thisisclassicalguitar.com/how-to-play-legato-on-classical-guitar/ | 200 | How to Play Legato on Classical Guitar / This is Classical Guitar |
| https://www.guitarlessons.com/guitar-lessons/lead-guitar/5-essential-guitar-scales/ | 200 |  The 5 Essential Guitar Scales - Guitar Lesson  |
| https://www.thisisclassicalguitar.com/lesson-shifts-string-noise-guitar/ | 200 | Lesson: Shifts and String Noise on Guitar / This is Classical Guitar |
| https://www.youtube.com/watch?v=qO3yqu96q28 | 200 | America A Horse With No Name Guitar Lesson + Tutorial |
| https://www.thisisclassicalguitar.com/lesson-slurs-for-classical-guitar/ | 200 | Slurs on Classical Guitar (Hammer-Ons, Pull-Offs) / This is Classical Guitar |
| https://www.guitarlessons.com/guitar-lessons/guitar-lessons-for-beginners/5-essential-steps-to-learn-travis-picking/ | 200 |  5 Essential Steps to Learn Travis Picking  |
| https://www.thisisclassicalguitar.com/barre-lessons-and-exercises-for-guitar/ | 200 | Barre Lessons and Exercises for Guitar / This is Classical Guitar |
| https://www.thisisclassicalguitar.com/lesson-right-hand-planting-preparation/ | 200 | Lesson: Right Hand Planting for Classical Guitar / This is Classical Guitar |
| https://www.thisisclassicalguitar.com/spanish-romance-tab-free-pdf/ | 200 | Spanish Romance (Romanza) - Free PDF Sheet Music or Tab for Classical Guitar / This is Classical Guitar |
| https://www.youtube.com/watch?v=I2rSsaCPkwM | 200 | House Of The Rising Sun Guitar Lesson - The Animals - Easy Songs For Acoustic Guitar - Tutorial |
| https://www.thisisclassicalguitar.com/lesson-harmonics-classical-guitar/ | 200 | Lesson: Harmonics on the Classical Guitar / This is Classical Guitar |
| https://www.thisisclassicalguitar.com/beginner-tremolo-exercise-guitar/ | 200 | Beginner Tremolo Exercise for Guitar / This is Classical Guitar |
| https://www.youtube.com/watch?v=EYmHjJNlv9s | 200 | Let It Be by the Beatles Guitar Lesson and Tutorial |
| https://www.jazzguitar.be/blog/jazz-chord-progressions/ | 403 | Just a moment... |
| https://www.jazzguitar.be/blog/blue-bossa-chords/ | 403 | Just a moment... |
| https://www.guitarlessons.com/guitar-lessons/blues-guitar-quick-start-series/the-basic-12-bar-blues-riff/ | 200 |  The Basic 12-Bar Blues Riff - Blues Guitar Lessons  |
| https://www.musictheory.net/lessons/22 | 200 | musictheory.net |
| https://www.guitarlessons.com/guitar-lessons/guitar-lessons-for-beginners/minor-pentatonic-magic/ | 200 |  Minor Pentatonic Magic (with Ayla Tesler-Mabe)  |
| https://www.jazzguitar.be/blog/guitar-arpeggios/ | 403 | Just a moment... |
| https://www.musictheory.net/lessons/53 | 200 | musictheory.net |
| https://www.guitarlessons.com/guitar-lessons/guitar-lessons-for-beginners/breaking-the-blues-scale/ | 200 |  Breaking the Blues Scale (Blues Solo Guitar Lesson #5)  |
| https://www.musictheory.net/lessons/55 | 200 | musictheory.net |
| https://www.guitarlessons.com/guitar-lessons/blues-guitar-quick-start-series/how-to-choose-blues-notes/ | 200 |  How to Choose Blues Notes - Blues Guitar Lessons  |
| https://www.youtube.com/watch?v=nnrfjyTaUHQ | 200 | Autumn Leaves Guitar Lesson / Chord Melody Tutorial (FREE TABS) |
| https://www.guitarlessons.com/guitar-lessons/blues-guitar-quick-start-series/turnaround-blues-guitar-licks/ | 200 |  Turnaround Blues Guitar Licks - Blues Guitar Lessons  |
| https://www.musictheory.net/lessons/51 | 200 | musictheory.net |
| https://www.jazzguitar.be/blog/guitar-modes/ | 403 | Just a moment... |
| https://www.musictheory.net/lessons/14 | 200 | musictheory.net |
| https://www.youtube.com/watch?v=oezlSpMQ6d4 | 200 | Learn to Play The Beatles Blackbird • Guitar Lesson + Tutorial |
| https://www.musictheory.net/lessons/57 | 200 | musictheory.net |
| https://www.musictheory.net/lessons/52 | 200 | musictheory.net |
| https://www.musictheory.net/lessons/50 | 200 | musictheory.net |
| https://www.thisisclassicalguitar.com/right-hand-articulation-classical-guitar/ | 200 | Lesson: Right Hand Articulation for Classical Guitar / This is Classical Guitar |
| https://classicalguitarshed.com/analysis/ | 200 | First Steps to Learning New Music - Practical Analysis |
| https://classicalguitarshed.com/problem-solving-classical-guitar-polishing/ | 200 | Play with Fewer Mistakes - Learn Music with these Methods |
| https://www.youtube.com/watch?v=CrjnGjtozgY | 200 | Grade 4 Lesson: Lágrima, Preludio by Tárrega for Classical Guitar |
| https://www.thisisclassicalguitar.com/bourree-bwv-996-bach-lesson-pdf/ | 200 | Bach Bourrée in E Minor, BWV 996 for Guitar – Free PDF / This is Classical Guitar |
| https://www.youtube.com/watch?v=iFDPa2rADfo | 200 | Part 1: Ode to Joy Guitar Lesson (Melody) |
| https://www.youtube.com/watch?v=L9Z6OONa84g | 200 | TWINKLE TWINKLE LITTLE STAR: Guitar Lesson + TAB |
| https://www.youtube.com/watch?v=mMnla7_Ipr4 | 200 | Knocking on Heaven's Door - Super Easy Acoustic Songs for Guitar - Guitar Lesson |
| https://www.youtube.com/watch?v=3UV1CtIUOmU | 200 | Nirvana - Come As You Are - Guitar Lesson - How to Play on guitar - Kurt Cobain |
| https://www.youtube.com/watch?v=IzxMeQgtyYE | 200 | Wish You Were Here Pink Floyd Guitar Lesson + Tutorial |
| https://www.youtube.com/watch?v=35pI-MrsdKo | 200 | Happy Birthday - Easy Guitar Lesson Tutorial for Beginners! |
| https://www.youtube.com/watch?v=7silbMA9UME | 200 | Metallica Nothing Else Matters Guitar Lesson Part 1 |
| https://www.youtube.com/watch?v=o7Hj0WF7AU0 | 200 | How To Play Jeff Buckley - Hallelujah |
| https://www.youtube.com/watch?v=tvwsFfmKw6A | 200 | Dust in the Wind Kansas Guitar Lesson + Tutorial |
| https://www.youtube.com/watch?v=faqlT80if_Y | 200 | Lesson: Greensleeves (Easy Anonymous Lute Arrangement) for Classical Guitar |
| https://www.youtube.com/watch?v=iS9kWyI1dxw | 200 | How to Play "Tears In Heaven" on Guitar - Eric Clapton, Acoustic Fingerstyle |
| https://www.youtube.com/watch?v=diYzEvWQvPU | 200 | Spanish Romance / Romanza (Lesson & Free PDF) for Classical Guitar |
| https://www.youtube.com/watch?v=Ipo0ycATcNY | 200 | Bourree BWV 996 by Bach, Lesson & Free PDF for Classical Guitar |
