// @vitest-environment jsdom
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import type {ProgressController} from '../useProgress';

const auth=vi.hoisted(()=>({signInWithPassword:vi.fn(),signUp:vi.fn(),resetPasswordForEmail:vi.fn()}));
vi.mock('../cloud',()=>({cloud:{auth}}));
vi.stubEnv('VITE_TURNSTILE_SITE_KEY','unit-test-site-key');
const {Account}=await import('./Account');
let callbacks:Record<string,unknown>;
const controller={user:null,recovery:false} as ProgressController;
const verify=()=>act(()=>{(callbacks.callback as (token:string)=>void)('one-use-token');});
beforeEach(()=>{
  vi.clearAllMocks();
  auth.signInWithPassword.mockResolvedValue({error:{code:'invalid_credentials'}});
  auth.signUp.mockResolvedValue({data:{session:null},error:null});
  auth.resetPasswordForEmail.mockResolvedValue({error:null});
  window.turnstile={render:vi.fn((_,options)=>{callbacks=options;return 'widget';}),remove:vi.fn()};
});
afterEach(()=>{cleanup();delete window.turnstile;});
async function open(){render(<Account controller={controller}/>);await waitFor(()=>expect(window.turnstile!.render).toHaveBeenCalled());}
function fill(){fireEvent.change(screen.getByLabelText('E-mail'),{target:{value:'test@example.com'}});fireEvent.change(screen.getByLabelText('Hasło'),{target:{value:'test-password'}});}
describe('CAPTCHA authentication boundary',()=>{
  it('blocks submission without verification, forwards token and resets after failure',async()=>{
    await open();fill();
    const button=screen.getByRole('button',{name:'Zaloguj się'}) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.submit(button.closest('form')!);
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
    verify();expect(button.disabled).toBe(false);fireEvent.click(button);
    await waitFor(()=>expect(auth.signInWithPassword).toHaveBeenCalledWith({email:'test@example.com',password:'test-password',options:{captchaToken:'one-use-token'}}));
    await screen.findByText('Nieprawidłowy e-mail lub hasło.');
    expect(button.disabled).toBe(true);
  });
  it('invalidates an expired token and ignores callbacks from a removed widget',async()=>{
    await open();verify();
    act(()=>{(callbacks['expired-callback'] as ()=>void)();});
    expect((screen.getByRole('button',{name:'Zaloguj się'}) as HTMLButtonElement).disabled).toBe(true);
    const oldCallback=callbacks.callback as (token:string)=>void;
    fireEvent.click(screen.getByRole('button',{name:'Pierwszy raz? Utwórz konto'}));
    await waitFor(()=>expect(window.turnstile!.remove).toHaveBeenCalled());
    act(()=>oldCallback('stale-token'));
    expect((screen.getByRole('button',{name:'Utwórz konto'}) as HTMLButtonElement).disabled).toBe(true);
  });
  it('passes verification to signup',async()=>{
    await open();fireEvent.click(screen.getByRole('button',{name:'Pierwszy raz? Utwórz konto'}));
    await waitFor(()=>expect(window.turnstile!.render).toHaveBeenCalledTimes(2));fill();verify();
    fireEvent.click(screen.getByRole('button',{name:'Utwórz konto'}));
    await waitFor(()=>expect(auth.signUp).toHaveBeenCalledWith(expect.objectContaining({options:expect.objectContaining({captchaToken:'one-use-token'})})));
  });
  it('passes verification to password reset and clears a consumed token',async()=>{
    await open();fireEvent.click(screen.getByRole('button',{name:'Nie pamiętam hasła'}));
    await waitFor(()=>expect(window.turnstile!.render).toHaveBeenCalledTimes(2));
    fireEvent.change(screen.getByLabelText('E-mail'),{target:{value:'test@example.com'}});verify();
    fireEvent.click(screen.getByRole('button',{name:'Wyślij link do zmiany hasła'}));
    await waitFor(()=>expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com',expect.objectContaining({captchaToken:'one-use-token'})));
    await screen.findByText('Jeśli konto istnieje, otrzymasz wiadomość z linkiem do zmiany hasła.');
    expect((screen.getByRole('button',{name:'Wyślij link do zmiany hasła'}) as HTMLButtonElement).disabled).toBe(true);
  });
  it('offers retry on widget error without permitting unverified submission',async()=>{
    await open();verify();act(()=>{(callbacks['error-callback'] as ()=>void)();});
    expect((screen.getByRole('button',{name:'Zaloguj się'}) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button',{name:'Ponów weryfikację'}));
    await waitFor(()=>expect(window.turnstile!.render).toHaveBeenCalledTimes(2));
  });
});
