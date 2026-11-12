import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { MapPin, ShieldOff, Radio } from "lucide-react";
import { getTripShare } from "@/lib/trip-share.functions";
import { LiveMapLazy } from "@/components/nurja/LiveMapLazy";
import { NurjaMark } from "@/components/nurja/Brand";

const shareQuery = (id: string) => queryOptions({
  queryKey: ["trip-share", id],
  queryFn: () => getTripShare({ data: { id } }),
  refetchInterval: (q) => (q.state.data?.active ? 10000 : false),
});

export const Route = createFileRoute("/track/$id")({
  head: () => ({
    meta: [
      { title: "Live Trip Tracking — NURJA" },
      { name: "description", content: "Follow a trusted NURJA user's live location during their trip." },
      { property: "og:title", content: "Live Trip Tracking — NURJA" },
      { property: "og:description", content: "Follow a trusted NURJA user's live location during their trip." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(shareQuery(params.id)),
  component: TrackPage,
  errorComponent: () => <Msg title="Link not available" body="This tracking link is invalid or could not be loaded." />,
  notFoundComponent: () => <Msg title="Link not found" body="This tracking link does not exist." />,
});

function Msg({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background p-6 text-center">
      <div className="max-w-sm space-y-3"><NurjaMark /><ShieldOff className="mx-auto h-10 w-10 text-muted-foreground" /><h1 className="font-display text-xl font-bold">{title}</h1><p className="text-sm text-muted-foreground">{body}</p></div>
    </div>
  );
}

function TrackPage() {
  const { id } = Route.useParams();
  const { data: s } = useSuspenseQuery(shareQuery(id));
  if (!s) return <Msg title="Link not found" body="This tracking link does not exist." />;
  if (!s.active) return <Msg title="Sharing stopped" body={`${s.sharer_name || "The user"} has stopped sharing their location.`} />;
  const me = s.lat != null && s.lng != null ? ([s.lat, s.lng] as [number, number]) : undefined;
  const dest = s.dest_lat != null && s.dest_lng != null ? ([s.dest_lat, s.dest_lng] as [number, number]) : undefined;
  const mins = Math.max(0, Math.round((Date.now() - new Date(s.updated_at).getTime()) / 60000));
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3">
        <NurjaMark />
        <span className="flex items-center gap-1.5 rounded-full bg-emerald/10 px-2.5 py-1 text-xs font-bold text-emerald"><Radio className="h-3.5 w-3.5 animate-pulse" /> Live</span>
      </header>
      <div className="relative flex flex-1 flex-col">
        <LiveMapLazy className="min-h-[70vh] flex-1" me={me} endpoints={me && dest ? [me, dest] : undefined} />
        <div className="absolute inset-x-3 bottom-3 z-[500] rounded-2xl border bg-card p-4 shadow-card">
          <p className="font-display font-bold">{s.sharer_name || "NURJA user"} is sharing their trip</p>
          <p className="text-xs text-muted-foreground">{me ? (mins < 1 ? "Updated just now" : `Updated ${mins} min ago`) : "Waiting for location…"}</p>
          {dest && <p className="mt-2 flex items-center gap-1.5 text-sm"><MapPin className="h-4 w-4 text-emerald" /> {s.dest_label || "Destination"}</p>}
          <p className="mt-2 text-[11px] text-muted-foreground">In an emergency call 999.</p>
        </div>
      </div>
    </div>
  );
}
