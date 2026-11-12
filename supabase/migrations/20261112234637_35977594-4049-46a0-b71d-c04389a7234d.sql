REVOKE EXECUTE ON FUNCTION public.get_trip_share(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trip_share(uuid) TO service_role;