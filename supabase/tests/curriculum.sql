-- Run as the database owner in a transaction. Nothing is persisted.
begin;
do $$ begin
 if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('curriculum_editors','curriculum_draft','curriculum_releases') and not c.relrowsecurity) then raise exception 'RLS missing'; end if;
 if has_table_privilege('authenticated','public.curriculum_releases','INSERT') or has_table_privilege('authenticated','public.curriculum_editors','INSERT') then raise exception 'Unexpected write grant'; end if;
end $$;
set local role anon;
do $$ begin
 if (select count(*) from public.curriculum_releases)=0 then raise exception 'Missing public program'; end if;
 begin perform public.start_curriculum_draft();raise exception 'Anonymous draft creation allowed';exception when insufficient_privilege then null;end;
 begin perform 1 from public.curriculum_draft;raise exception 'Anonymous draft read allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000099',true);
set local role authenticated;
do $$ begin
 if public.is_curriculum_editor() then raise exception 'Unexpected editor role'; end if;
 if exists(select 1 from public.curriculum_draft) then raise exception 'Draft leaked'; end if;
 begin perform public.start_curriculum_draft();raise exception 'Reader draft creation allowed';exception when insufficient_privilege then null;end;
 begin perform public.publish_curriculum_draft(1);raise exception 'Reader publication allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select user_id::text from public.curriculum_editors limit 1),true);
set local role authenticated;
do $$ declare d public.curriculum_draft; content jsonb; published_version integer; bad jsonb; begin
 if not public.is_curriculum_editor() then raise exception 'Editor role missing'; end if;
 d:=public.start_curriculum_draft();content:=d.content;
 d:=public.save_curriculum_draft(d.revision,'Test transakcyjny',content);
 begin perform public.save_curriculum_draft(d.revision-1,'Stara karta',content);raise exception 'Stale write accepted';exception when serialization_failure then null;end;
 bad:=jsonb_set(content,'{lessons,0,prerequisites}',jsonb_build_array(content->'lessons'->0->>'id'));
 d:=public.save_curriculum_draft(d.revision,'Nieprawidłowa pętla',bad);
 begin perform public.publish_curriculum_draft(d.revision);raise exception 'Cycle accepted';exception when raise_exception then if sqlerrm not like 'Pętla%' then raise;end if;end;
 bad:=jsonb_set(content,'{lessons,0,challenge}',to_jsonb(not(content->'lessons'->0->>'challenge')::boolean));
 d:=public.save_curriculum_draft(d.revision,'Zmiana XP',bad);
 begin perform public.publish_curriculum_draft(d.revision);raise exception 'XP changed';exception when raise_exception then if sqlerrm not like 'Zachowaj identyfikatory%' then raise;end if;end;
 bad:=jsonb_set(content,'{sources,classical,url}','"javascript:alert(1)"');
 begin perform public.save_curriculum_draft(d.revision,'Nieprawidłowy URL',bad);raise exception 'Unsafe URL accepted';exception when raise_exception then if sqlerrm not like 'Nieprawidłowy format szkicu%' then raise;end if;end;
 d:=public.save_curriculum_draft(d.revision,'Poprawna publikacja testowa',content);
 published_version:=public.publish_curriculum_draft(d.revision);
 if published_version<>d.base_version+1 or exists(select 1 from public.curriculum_draft) then raise exception 'Publication was not atomic';end if;
 if (select r.content from public.curriculum_releases r where r.version=published_version)<>content then raise exception 'Published content differs';end if;
 begin perform public.publish_curriculum_draft(d.revision);raise exception 'Duplicate publication accepted';exception when serialization_failure then null;end;
 perform public.start_curriculum_draft();
 begin perform public.save_curriculum_draft(d.revision,'Stara karta sprzed publikacji',content);raise exception 'Old generation overwrote new draft';exception when serialization_failure then null;end;
end $$;
rollback;
select 'PASS: RLS, anonymous/reader denial, editor access, stale-write protection, graph/URL/XP validation, atomic publish; all test changes rolled back.' as verification;
