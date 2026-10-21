begin;
create table public.lesson_feedback (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id text not null,
 curriculum_version integer not null references public.curriculum_releases(version),
 category text not null check(category in ('unclear','difficulty','material','idea','other')),
 body text not null check(length(trim(body)) between 3 and 5000),
 context jsonb not null,
 created_at timestamptz not null default clock_timestamp(),
 status text not null default 'new' check(status in ('new','read','planned','resolved')),
 revision integer not null default 1,
 reviewed_at timestamptz
);
create index lesson_feedback_owner_lesson on public.lesson_feedback(user_id,lesson_id,created_at desc,id);
create index lesson_feedback_inbox on public.lesson_feedback(created_at desc,id);
alter table public.lesson_feedback enable row level security;
create policy feedback_read on public.lesson_feedback for select to authenticated
 using ((select auth.uid())=user_id or (select public.is_curriculum_editor()));
revoke all on public.lesson_feedback from public,anon,authenticated;
grant select on public.lesson_feedback to authenticated;

-- Context is generated from an immutable published release, never trusted from the browser.
-- A stable request ID makes retrying a timed-out submission safe.
create function public.submit_lesson_feedback(request_id uuid, target_lesson text, program_version integer, feedback_category text, feedback_body text)
returns public.lesson_feedback language plpgsql security definer set search_path='' as $$
declare result public.lesson_feedback; program jsonb; lesson jsonb; snapshot jsonb;
begin
 if auth.uid() is null then raise exception 'Zaloguj się, aby wysłać feedback.' using errcode='42501'; end if;
 if request_id is null or target_lesson is null or program_version is null or feedback_category is null or feedback_category not in ('unclear','difficulty','material','idea','other') or feedback_body is null or length(trim(feedback_body)) not between 3 and 5000 then
  raise exception 'Wybierz temat i wpisz od 3 do 5000 znaków.' using errcode='22023';
 end if;
 perform pg_advisory_xact_lock(hashtextextended(request_id::text,0));
 select * into result from public.lesson_feedback where id=request_id;
 if found then
  if result.user_id=auth.uid() and result.lesson_id=target_lesson and result.curriculum_version=program_version and result.category=feedback_category and result.body=trim(feedback_body) then return result; end if;
  raise exception 'Identyfikator zgłoszenia jest już używany. Odśwież listę przed kolejną próbą.' using errcode='22023';
 end if;
 select content into program from public.curriculum_releases where version=program_version;
 select value into lesson from jsonb_array_elements(program->'lessons') where value->>'id'=target_lesson;
 if lesson is null then raise exception 'Ta lekcja nie istnieje w opublikowanej wersji programu. Odśwież aplikację.' using errcode='22023'; end if;
 snapshot:=jsonb_build_object(
  'lesson',lesson,
  'chapter',(select value from jsonb_array_elements(program->'chapters') where value->>'id'=lesson->>'chapter'),
  'source',program->'sources'->(lesson->>'source'),
  'prerequisites',coalesce((select jsonb_agg(jsonb_build_object('id',value->>'id','title',value->>'title')) from jsonb_array_elements(program->'lessons') where (lesson->'prerequisites') ? (value->>'id')),'[]'::jsonb),
  'songChoices',coalesce((select jsonb_agg(value) from jsonb_array_elements(program->'songs') where (lesson->'songChoices') ? (value->>'id')),'[]'::jsonb)
 );
 insert into public.lesson_feedback(id,user_id,lesson_id,curriculum_version,category,body,context)
 values(request_id,auth.uid(),target_lesson,program_version,feedback_category,trim(feedback_body),snapshot) returning * into result;
 return result;
end;
$$;

create function public.review_lesson_feedback(feedback_id uuid, expected_revision integer, next_status text)
returns public.lesson_feedback language plpgsql security definer set search_path='' as $$
declare result public.lesson_feedback;
begin
 if not public.is_curriculum_editor() then raise exception 'Brak uprawnień administratora.' using errcode='42501'; end if;
 if next_status is null or next_status not in ('new','read','planned','resolved') then raise exception 'Nieprawidłowy status.' using errcode='22023'; end if;
 update public.lesson_feedback set status=next_status,revision=revision+1,reviewed_at=clock_timestamp()
 where id=feedback_id and revision=expected_revision returning * into result;
 if not found then raise exception 'Feedback zmienił się w innej karcie. Odśwież listę.' using errcode='40001'; end if;
 return result;
end;
$$;

-- One JSON result bypasses the REST row limit. All entries are read in one snapshot.
create function public.export_lesson_feedback(export_scope text default 'mine')
returns jsonb language plpgsql security invoker set search_path='' as $$
declare entries jsonb;
begin
 if auth.uid() is null then raise exception 'Zaloguj się, aby pobrać feedback.' using errcode='42501'; end if;
 if export_scope is null or export_scope not in ('mine','all') then raise exception 'Nieprawidłowy zakres eksportu.' using errcode='22023'; end if;
 if export_scope='all' and not public.is_curriculum_editor() then raise exception 'Brak uprawnień administratora.' using errcode='42501'; end if;
 select coalesce(jsonb_agg(to_jsonb(f) order by f.created_at,f.id),'[]'::jsonb) into entries
 from public.lesson_feedback f where export_scope='all' or f.user_id=auth.uid();
 return jsonb_build_object('format','guitar-quest-feedback','schemaVersion',1,'exportedAt',clock_timestamp(),'scope',export_scope,'count',jsonb_array_length(entries),'entries',entries);
end;
$$;
revoke all on function public.submit_lesson_feedback(uuid,text,integer,text,text),public.review_lesson_feedback(uuid,integer,text),public.export_lesson_feedback(text) from public,anon;
grant execute on function public.submit_lesson_feedback(uuid,text,integer,text,text),public.review_lesson_feedback(uuid,integer,text),public.export_lesson_feedback(text) to authenticated;
commit;
