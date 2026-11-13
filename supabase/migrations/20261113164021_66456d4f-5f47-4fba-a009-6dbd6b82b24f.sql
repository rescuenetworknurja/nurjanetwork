DO $$
DECLARE target_user uuid;
BEGIN
  SELECT id INTO target_user FROM auth.users WHERE id = '7cf4c3ce-6c75-4a1a-a688-8028d521c2ef'::uuid AND lower(email) = 'rescuenetwork.safeher@gmail.com' AND email_confirmed_at IS NOT NULL;
  IF target_user IS NULL THEN RAISE EXCEPTION 'Verified target account not found'; END IF;
  INSERT INTO public.user_roles (user_id, role) SELECT target_user, 'admin'::public.app_role WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user AND role = 'admin'::public.app_role);
  IF NOT public.has_role(target_user, 'admin'::public.app_role) THEN RAISE EXCEPTION 'Administrator grant verification failed'; END IF;
  IF NOT public.has_role('afd220e8-78c2-4ef1-afca-df379cfa0905'::uuid, 'admin'::public.app_role) THEN RAISE EXCEPTION 'Existing administrator must retain access'; END IF;
END $$;