CREATE TABLE public.trip_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sharer_name text NOT NULL DEFAULT '',
  lat double precision, lng double precision,
  dest_lat double precision, dest_lng double precision, dest_label text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_shares TO authenticated;
GRANT ALL ON public.trip_shares TO service_role;
ALTER TABLE public.trip_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own trip shares" ON public.trip_shares FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trip_shares_updated BEFORE UPDATE ON public.trip_shares FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_trip_share(_id uuid)
RETURNS TABLE(sharer_name text, lat double precision, lng double precision, dest_lat double precision, dest_lng double precision, dest_label text, active boolean, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.sharer_name,
    CASE WHEN t.active THEN t.lat END, CASE WHEN t.active THEN t.lng END,
    CASE WHEN t.active THEN t.dest_lat END, CASE WHEN t.active THEN t.dest_lng END,
    CASE WHEN t.active THEN t.dest_label END, t.active, t.updated_at
  FROM public.trip_shares t WHERE t.id = _id
$$;
GRANT EXECUTE ON FUNCTION public.get_trip_share(uuid) TO anon, authenticated;