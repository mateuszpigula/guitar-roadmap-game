// @vitest-environment jsdom
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {ThemeProvider,THEME_KEY,useTheme} from './theme';
import {ThemePicker} from './components/ThemePicker';
import {Turnstile} from './components/Turnstile';
let media:EventTarget&{matches:boolean};
function Probe(){const {theme}=useTheme();return <output data-testid="theme">{theme}</output>;}
function View(){return <ThemeProvider><ThemePicker/><Probe/></ThemeProvider>;}
beforeEach(()=>{
 localStorage.clear();media=Object.assign(new EventTarget(),{matches:false});
 vi.stubGlobal('matchMedia',vi.fn(()=>media));
 document.head.innerHTML='<meta name="theme-color" content="#f8f6f0">';
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();delete window.turnstile;});
it('follows the system until explicitly overridden and returns to it',()=>{
 render(<View/>);expect(screen.getByTestId('theme').textContent).toBe('light');
 act(()=>{media.matches=true;media.dispatchEvent(new Event('change'));});
 expect(document.documentElement.dataset.theme).toBe('dark');
 fireEvent.click(screen.getByRole('button',{name:'Motyw: jasny'}));
 act(()=>media.dispatchEvent(new Event('change')));
 expect(screen.getByTestId('theme').textContent).toBe('light');
 fireEvent.click(screen.getByRole('button',{name:'Motyw: systemowy'}));
 expect(screen.getByTestId('theme').textContent).toBe('dark');
 expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#191d1a');
});
it('restores the choice after remount without modifying learning data',()=>{
 localStorage.setItem('learning-progress','keep');
 const first=render(<View/>);fireEvent.click(screen.getByRole('button',{name:'Motyw: ciemny'}));
 first.unmount();render(<View/>);
 expect(screen.getByTestId('theme').textContent).toBe('dark');
 expect(screen.getByRole('button',{name:'Motyw: ciemny',pressed:true})).toBeTruthy();
 expect(screen.getAllByRole('button',{pressed:true})).toHaveLength(1);
 expect(localStorage.getItem('learning-progress')).toBe('keep');
});
it('receives a preference changed in another tab',()=>{
 render(<View/>);
 act(()=>{localStorage.setItem(THEME_KEY,'dark');window.dispatchEvent(new StorageEvent('storage',{key:THEME_KEY,newValue:'dark'}));});
 expect(screen.getByTestId('theme').textContent).toBe('dark');
 act(()=>{localStorage.clear();window.dispatchEvent(new StorageEvent('storage',{key:null}));});
 expect(screen.getByTestId('theme').textContent).toBe('light');
});
it('still switches theme if browser storage is unavailable',()=>{
 vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('blocked');});
 vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('blocked');});
 render(<View/>);fireEvent.click(screen.getByRole('button',{name:'Motyw: ciemny'}));
 expect(document.documentElement.dataset.theme).toBe('dark');
 expect(screen.getByText(/Motyw działa w tej sesji/)).toBeTruthy();
});
it.each([
 ['dark',false,'dark'],['light',true,'light'],['system',true,'dark'],['invalid',false,'light'],[null,true,'dark'],
] as const)('applies %s before React loads without a light flash', (stored,systemDark,expected)=>{
 media.matches=systemDark;if(stored)localStorage.setItem(THEME_KEY,stored);
 const html=readFileSync('index.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)![1];
 new Function('window','document','localStorage',script)(window,document,localStorage);
 expect(document.documentElement.dataset.theme).toBe(expected);
 render(<View/>);expect(screen.getByTestId('theme').textContent).toBe(expected);
});
it('rerenders CAPTCHA in the chosen theme and invalidates its old token',async()=>{
 const onToken=vi.fn(),api={render:vi.fn().mockReturnValue('widget'),remove:vi.fn()};window.turnstile=api;
 render(<ThemeProvider><ThemePicker/><Turnstile siteKey="test-key" onToken={onToken}/></ThemeProvider>);
 await waitFor(()=>expect(api.render).toHaveBeenCalledOnce());
 expect(api.render.mock.calls[0][1]).toMatchObject({theme:'light'});
 onToken.mockClear();fireEvent.click(screen.getByRole('button',{name:'Motyw: ciemny'}));
 await waitFor(()=>expect(api.render).toHaveBeenCalledTimes(2));
 expect(api.render.mock.calls[1][1]).toMatchObject({theme:'dark'});
 expect(api.remove).toHaveBeenCalledWith('widget');expect(onToken).toHaveBeenCalledWith('');
});
