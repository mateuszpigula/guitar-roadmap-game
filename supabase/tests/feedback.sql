-- Run as database administrator. All fixtures are rolled back, including users.
begin;
insert into auth.users(id) values('fda00000-0000-4000-8000-000000000001'),('fda00000-0000-4000-8000-000000000002');
do $$ begin
 if not (select relrowsecurity from pg_class where oid='public.lesson_feedback'::regclass) then raise exception 'RLS missing';end if;
 if has_table_privilege('authenticated','public.lesson_feedback','INSERT') or has_table_privilege('authenticated','public.lesson_feedback','UPDATE') or has_table_privilege('authenticated','public.lesson_feedback','DELETE') then raise exception 'Direct mutation allowed';end if;
end $$;
set local role anon;
do $$ begin
 begin perform 1 from public.lesson_feedback;raise exception 'Anonymous read allowed';exception when insufficient_privilege then null;end;
 begin perform public.export_lesson_feedback('all');raise exception 'Anonymous export allowed';exception when insufficient_privilege then null;end;
 begin perform public.submit_lesson_feedback(gen_random_uuid(),'ch-01-1',2,'idea','Test');raise exception 'Anonymous submission allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','fda00000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$ declare f public.lesson_feedback; repeated public.lesson_feedback; e jsonb; begin
 f:=public.submit_lesson_feedback('fda10000-0000-4000-8000-000000000001','ch-01-1',2,'unclear','  Przyda się wolniejszy przykład.  ');
 if f.user_id<>auth.uid() or f.body<>'Przyda się wolniejszy przykład.' or f.context->'lesson'->>'id'<>'ch-01-1' then raise exception 'Incorrect owner/body/context';end if;
 if f.context->'lesson'<>(select content->'lessons'->0 from public.curriculum_releases where version=2) then raise exception 'Wrong historical lesson snapshot';end if;
 if f.context ? 'notes' then raise exception 'Private notes in context';end if;
 repeated:=public.submit_lesson_feedback(f.id,'ch-01-1',2,'unclear',f.body);
 if repeated.id<>f.id or (select count(*) from public.lesson_feedback)<>1 then raise exception 'Retry created duplicate';end if;
 begin perform public.submit_lesson_feedback(f.id,'ch-01-1',2,'idea','Different content');raise exception 'Reused ID changed data';exception when invalid_parameter_value then null;end;
 begin perform public.submit_lesson_feedback(gen_random_uuid(),'missing-lesson',2,'idea','Test');raise exception 'Unknown lesson accepted';exception when invalid_parameter_value then null;end;
 begin perform public.submit_lesson_feedback(gen_random_uuid(),'ch-01-1',999999,'idea','Test');raise exception 'Unknown release accepted';exception when invalid_parameter_value then null;end;
 begin perform public.submit_lesson_feedback(gen_random_uuid(),'ch-01-1',2,'idea',' ');raise exception 'Empty body accepted';exception when invalid_parameter_value then null;end;
 begin perform public.submit_lesson_feedback(gen_random_uuid(),'ch-01-1',2,'other',repeat('a',5001));raise exception 'Oversized body accepted';exception when invalid_parameter_value then null;end;
 begin perform public.submit_lesson_feedback(gen_random_uuid(),'ch-01-1',2,'invalid','Test');raise exception 'Invalid category accepted';exception when invalid_parameter_value then null;end;
 begin perform public.review_lesson_feedback(f.id,1,'resolved');raise exception 'Reader review allowed';exception when insufficient_privilege then null;end;
 begin perform public.export_lesson_feedback('all');raise exception 'Reader exported other users';exception when insufficient_privilege then null;end;
 e:=public.export_lesson_feedback('mine');if (e->>'count')::integer<>1 or e->>'format'<>'guitar-quest-feedback' then raise exception 'Own export failed';end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','fda00000-0000-4000-8000-000000000002',true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.lesson_feedback) then raise exception 'Another user can read feedback';end if;
 if (public.export_lesson_feedback('mine')->>'count')::integer<>0 then raise exception 'Another user export leaked feedback';end if;
 begin perform public.submit_lesson_feedback('fda10000-0000-4000-8000-000000000001','ch-01-1',2,'unclear','Przyda się wolniejszy przykład.');raise exception 'Cross-user ID leak';exception when invalid_parameter_value then null;end;
 perform public.submit_lesson_feedback('fda10000-0000-4000-8000-000000000002','ch-01-1',2,'idea','Inna osoba, własna uwaga.');
end $$;
reset role;
-- More than the normal REST row limit; export must still contain every entry.
insert into public.lesson_feedback(id,user_id,lesson_id,curriculum_version,category,body,context)
select gen_random_uuid(),f.user_id,f.lesson_id,f.curriculum_version,f.category,'Test pełnego eksportu '||n,f.context from public.lesson_feedback f cross join generate_series(1,1005) n where f.id='fda10000-0000-4000-8000-000000000001';
select set_config('request.jwt.claim.sub','fda00000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$ declare e jsonb; begin e:=public.export_lesson_feedback('mine');if (e->>'count')::integer<>1006 or jsonb_array_length(e->'entries')<>1006 then raise exception 'Export truncated';end if;end $$;
reset role;
select set_config('request.jwt.claim.sub',(select user_id::text from public.curriculum_editors limit 1),true);
set local role authenticated;
do $$ declare f public.lesson_feedback; e jsonb; begin
 if (select count(*) from public.lesson_feedback where id in ('fda10000-0000-4000-8000-000000000001','fda10000-0000-4000-8000-000000000002'))<>2 then raise exception 'Admin cannot read both users';end if;
 f:=public.review_lesson_feedback('fda10000-0000-4000-8000-000000000001',1,'planned');
 if f.status<>'planned' or f.revision<>2 or f.reviewed_at is null then raise exception 'Admin review failed';end if;
 begin perform public.review_lesson_feedback(f.id,1,'resolved');raise exception 'Stale review accepted';exception when serialization_failure then null;end;
 begin perform public.review_lesson_feedback(f.id,2,'invalid');raise exception 'Invalid review status accepted';exception when invalid_parameter_value then null;end;
 e:=public.export_lesson_feedback('all');if (e->>'count')::integer<1007 then raise exception 'Admin export incomplete';end if;
 if not exists(select 1 from jsonb_array_elements(e->'entries') x where x->>'id'=f.id::text and x->>'status'='planned') then raise exception 'Export missed reviewed feedback';end if;
end $$;
rollback;
select 'PASS: feedback RLS, account isolation, immutable context, retries, input validation, admin reviews, stale writes, full export of 1006+ entries. Test users and feedback rolled back.' as verification;
