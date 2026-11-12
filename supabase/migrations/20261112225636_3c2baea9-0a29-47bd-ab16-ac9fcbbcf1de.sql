create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''),
          coalesce(new.phone, new.raw_user_meta_data ->> 'phone'));
  if new.email = 'nurja.rescuenetwork@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end; $$;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
update public.profiles p set phone = u.raw_user_meta_data ->> 'phone'
from auth.users u where u.id = p.id and p.phone is null;