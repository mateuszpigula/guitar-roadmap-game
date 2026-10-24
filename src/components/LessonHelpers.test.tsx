// @vitest-environment jsdom
import {cleanup,render,screen} from '@testing-library/react';
import {afterEach,expect,it} from 'vitest';
import {LessonChords} from './ChordDiagram';
import {LessonMaterial} from './LessonMaterial';
import {lessonById,songById} from '../content/catalog';
afterEach(cleanup);
it('shows precisely the chords used in the exercise with string and finger instructions',()=>{render(<LessonChords lessonId="ch-02-4"/>);const diagrams=screen.getAllByRole('img');expect(diagrams).toHaveLength(3);expect(diagrams[0].getAttribute('aria-label')).toContain('Akord C. Od struny 6 do 1: pomiń; próg 3, palec 3');expect(screen.getByText('X 3 2 0 1 0')).toBeTruthy();expect(screen.getByText('X X 0 2 3 2')).toBeTruthy();});
it('does not send a scene to an unrelated song before a choice',()=>{render(<LessonMaterial lesson={lessonById['rep-02']}/>);expect(screen.queryByRole('link')).toBeNull();expect(screen.getByText(/Wybierz utwór na początku/)).toBeTruthy();});
it('updates the source to the chosen song and ignores invalid saved selections',()=>{const lesson=lessonById['rep-02'],[first,second]=lesson.songChoices!;const {rerender}=render(<LessonMaterial lesson={lesson} selectedSongId={first}/>);expect(screen.getByRole('link').getAttribute('href')).toBe(songById[first].url);rerender(<LessonMaterial lesson={lesson} selectedSongId={second}/>);expect(screen.getByRole('link').getAttribute('href')).toBe(songById[second].url);rerender(<LessonMaterial lesson={lesson} selectedSongId="missing"/>);expect(screen.queryByRole('link')).toBeNull();});
