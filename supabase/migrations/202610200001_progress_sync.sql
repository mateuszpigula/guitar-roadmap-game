begin;
create table public.guitar_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object' and state->>'version' = '1' and octet_length(state::text) <= 5000000),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.guitar_progress enable row level security;
create policy own_progress on public.guitar_progress for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.guitar_progress from anon;
grant select, insert, update on public.guitar_progress to authenticated;
-- Optimistic concurrency: a stale device must merge before it can save.
create function public.save_guitar_progress(expected_revision bigint, next_state jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare affected integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if expected_revision = 0 then
    insert into public.guitar_progress(user_id,state,revision)
      values(auth.uid(),next_state,1) on conflict(user_id) do nothing;
  else
    update public.guitar_progress set state=next_state,revision=revision+1,updated_at=now()
      where user_id=auth.uid() and revision=expected_revision;
  end if;
  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;
revoke all on function public.save_guitar_progress(bigint,jsonb) from public, anon;
grant execute on function public.save_guitar_progress(bigint,jsonb) to authenticated;
commit;
