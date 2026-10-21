// @vitest-environment jsdom
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import CurriculumEditor from './CurriculumEditor';
import {bundledContent} from '../content/catalog';
import * as api from '../content/admin';
import type {Draft,Release} from '../content/model';
vi.mock('../content/admin',()=>({isEditor:vi.fn(),readEditor:vi.fn(),releaseHistory:vi.fn(),startDraft:vi.fn(),saveDraft:vi.fn(),publishDraft:vi.fn()}));
let published:Release,draft:Draft;
const onDirty=vi.fn();
beforeEach(()=>{vi.resetAllMocks();Element.prototype.scrollIntoView=vi.fn();published={version:2,title:'Program',content:structuredClone(bundledContent),published_at:'2026-10-21T12:00:00Z'};draft={id:1,base_version:2,revision:1,title:'Szkic',content:structuredClone(bundledContent),updated_at:'2026-10-21T12:00:00Z'};vi.mocked(api.isEditor).mockResolvedValue(true);vi.mocked(api.readEditor).mockResolvedValue({published,draft});vi.mocked(api.releaseHistory).mockResolvedValue([published]);});
afterEach(cleanup);
describe('curriculum editor',()=>{
 it('does not request protected content for a guest',async()=>{render(<CurriculumEditor onDirty={onDirty}/>);expect(await screen.findByText(/Zaloguj się na konto administratora/)).toBeTruthy();expect(api.readEditor).not.toHaveBeenCalled();});
 it('denies a signed-in account without the editor role',async()=>{vi.mocked(api.isEditor).mockResolvedValue(false);render(<CurriculumEditor userId="reader" onDirty={onDirty}/>);expect(await screen.findByText(/Ten panel jest dostępny/)).toBeTruthy();expect(api.readEditor).not.toHaveBeenCalled();});
 it('requires saved, validated changes and a second publication action',async()=>{
  vi.mocked(api.saveDraft).mockImplementation(async(d,content,title)=>({...d,content,title,revision:d.revision+1}));vi.mocked(api.publishDraft).mockResolvedValue(3);
  render(<CurriculumEditor userId="editor" onDirty={onDirty}/>);const title=await screen.findByLabelText('Tytuł lekcji');fireEvent.change(title,{target:{value:'Nowy tytuł'}});
  expect((screen.getByRole('button',{name:'Sprawdź i opublikuj'}) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button',{name:'Zapisz szkic'}));await screen.findByText('Szkic zapisany w chmurze. Nie został jeszcze opublikowany.');
  expect(api.publishDraft).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:'Sprawdź i opublikuj'}));expect(api.publishDraft).not.toHaveBeenCalled();
  await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Opublikuj wersję 3'}));});expect(api.publishDraft).toHaveBeenCalledWith(2);
 });
 it('keeps unsaved input after a concurrent-save rejection',async()=>{vi.mocked(api.saveDraft).mockRejectedValue(Error('Szkic zmienił się w innej karcie.'));render(<CurriculumEditor userId="editor" onDirty={onDirty}/>);fireEvent.change(await screen.findByLabelText('Tytuł lekcji'),{target:{value:'Moja zmiana'}});fireEvent.click(screen.getByRole('button',{name:'Zapisz szkic'}));await screen.findByRole('alert');expect((screen.getByLabelText('Tytuł lekcji') as HTMLInputElement).value).toBe('Moja zmiana');expect(api.publishDraft).not.toHaveBeenCalled();});
 it('allows saving an incomplete new lesson but prevents publishing it',async()=>{render(<CurriculumEditor userId="editor" onDirty={onDirty}/>);await screen.findByLabelText('Tytuł lekcji');fireEvent.click(screen.getByRole('button',{name:'Dodaj lekcję'}));await waitFor(()=>expect((screen.getByLabelText('Tytuł lekcji') as HTMLInputElement).value).toBe('Nowa lekcja'));expect((screen.getByRole('button',{name:'Zapisz szkic'}) as HTMLButtonElement).disabled).toBe(false);expect((screen.getByRole('button',{name:'Sprawdź i opublikuj'}) as HTMLButtonElement).disabled).toBe(true);});
});
