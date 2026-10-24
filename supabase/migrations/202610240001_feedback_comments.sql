begin;
alter table public.lesson_feedback add column review_comment text not null default '' check (length(review_comment)<=5000);
-- Separate overload preserves compatibility with older clients changing only status.
create function public.review_lesson_feedback(feedback_id uuid, expected_revision integer, next_status text, admin_comment text)
returns public.lesson_feedback language plpgsql security definer set search_path='' as $$
declare result public.lesson_feedback;
begin
 if not public.is_curriculum_editor() then raise exception 'Brak uprawnień administratora.' using errcode='42501'; end if;
 if next_status is null or next_status not in ('new','read','planned','resolved') or admin_comment is null or length(admin_comment)>5000 then
  raise exception 'Nieprawidłowy status lub komentarz (maksymalnie 5000 znaków).' using errcode='22023';
 end if;
 update public.lesson_feedback set status=next_status,review_comment=trim(admin_comment),revision=revision+1,reviewed_at=clock_timestamp()
 where id=feedback_id and revision=expected_revision returning * into result;
 if not found then raise exception 'Feedback zmienił się w innej karcie. Odśwież listę.' using errcode='40001'; end if;
 return result;
end;
$$;
revoke all on function public.review_lesson_feedback(uuid,integer,text,text) from public,anon;
grant execute on function public.review_lesson_feedback(uuid,integer,text,text) to authenticated;
commit;
