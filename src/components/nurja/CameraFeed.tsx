import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/demo-store";
import { getVideoAccess } from "@/lib/video.functions";
import { Camera, Eye, RefreshCw, VideoOff, Wifi, WifiOff } from "lucide-react";

type Conn = "connecting" | "connected" | "reconnecting" | "disconnected" | "unavailable";
type Cam = "waiting" | "live" | "off" | "denied";

const connLabel: Record<Conn, string> = { connecting: "Connecting", connected: "Connected", reconnecting: "Reconnecting", disconnected: "Disconnected", unavailable: "Service unavailable" };
const camLabel: Record<Cam, string> = { waiting: "Waiting for camera", live: "Camera live", off: "Camera off", denied: "Camera blocked" };

function Pill({ tone, icon, text }: { tone: "ok" | "warn" | "bad"; icon: React.ReactNode; text: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold backdrop-blur", tone === "ok" ? "bg-emerald/85 text-paper" : tone === "warn" ? "bg-amber/90 text-ink" : "bg-crimson/90 text-paper")}>{icon}{text}</span>;
}

export function CameraFeed({ camera = "back", className, label, fit = "cover" }: { camera?: "back" | "front"; className?: string; label?: string; fit?: "cover" | "contain" }) {
  const d = useDemo();
  const video = useRef<HTMLVideoElement>(null);
  const [conn, setConn] = useState<Conn>("connecting");
  const [cam, setCam] = useState<Cam>("waiting");
  const [viewers, setViewers] = useState(0);
  const [publisher, setPublisher] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const id = d.sos?.id;
    if (!id) return;
    let disposed = false;
    let room: import("livekit-client").Room | undefined;
    setConn("connecting"); setCam("waiting"); setViewers(0);
    const connect = async () => {
      try {
        const access = await getVideoAccess({ data: { incidentId: id } });
        if (disposed) return;
        if (!access.configured) { setConn("unavailable"); return; }
        setPublisher(!!access.publisher);
        const { Room, RoomEvent, Track } = await import("livekit-client");
        const r = new Room(); room = r;
        const count = () => setViewers(access.publisher ? r.remoteParticipants.size : Math.max(0, r.remoteParticipants.size - 1) + 1);
        r.on(RoomEvent.TrackSubscribed, track => {
          if (track.kind === Track.Kind.Video && video.current) { track.attach(video.current); setCam("live"); }
          if (track.kind === Track.Kind.Audio) track.attach();
        });
        r.on(RoomEvent.TrackUnsubscribed, t => { if (t.kind === Track.Kind.Video) setCam("off"); });
        r.on(RoomEvent.TrackMuted, p => { if (p.kind === Track.Kind.Video) setCam("off"); });
        r.on(RoomEvent.TrackUnmuted, p => { if (p.kind === Track.Kind.Video) setCam("live"); });
        r.on(RoomEvent.ParticipantConnected, count);
        r.on(RoomEvent.ParticipantDisconnected, count);
        r.on(RoomEvent.Reconnecting, () => setConn("reconnecting"));
        r.on(RoomEvent.Reconnected, () => setConn("connected"));
        r.on(RoomEvent.Disconnected, () => { if (!disposed) { setConn("disconnected"); setCam("off"); } });
        await r.connect(access.url, access.token);
        if (disposed) { await r.disconnect(); return; }
        setConn("connected"); count();
        if (access.publisher) {
          try {
            await r.localParticipant.setCameraEnabled(true, { facingMode: camera === "back" ? "environment" : "user" });
          } catch { setCam("denied"); return; }
          // Denied audio does not cancel SOS.
          await r.localParticipant.setMicrophoneEnabled(true).catch(() => {});
          const track = r.localParticipant.getTrackPublication(Track.Source.Camera)?.track;
          if (track && video.current) { track.attach(video.current); video.current.muted = true; setCam("live"); }
        }
      } catch { if (!disposed) { setConn("disconnected"); setCam("off"); } }
    };
    void connect();
    return () => { disposed = true; void room?.disconnect(); };
  }, [d.sos?.id, camera, attempt]);

  const live = cam === "live" && conn !== "disconnected";
  const canRetry = conn === "disconnected" || cam === "denied";
  const connTone = conn === "connected" ? "ok" : conn === "connecting" || conn === "reconnecting" ? "warn" : "bad";
  const camTone = cam === "live" ? "ok" : cam === "waiting" ? "warn" : "bad";
  return (
    <div className={cn("relative min-h-40 overflow-hidden rounded-lg bg-ink text-paper", className)}>
      <video ref={video} autoPlay playsInline className={cn("absolute inset-0 h-full w-full", fit === "contain" ? "object-contain" : "object-cover")} />
      <div className="absolute left-2 right-2 top-2 z-10 flex flex-wrap gap-1.5" aria-live="polite">
        {live && <span className="rounded-md bg-crimson px-2 py-1 text-[11px] font-bold">Live</span>}
        <Pill tone={connTone} icon={conn === "connected" ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />} text={connLabel[conn]} />
        {conn !== "unavailable" && <Pill tone={camTone} icon={<Camera className="h-3 w-3" />} text={camLabel[cam]} />}
        {conn === "connected" && <Pill tone={viewers > 0 ? "ok" : "warn"} icon={<Eye className="h-3 w-3" />} text={publisher ? `Viewers: ${viewers}` : `Watching: ${viewers}`} />}
      </div>
      {!live && (
        <div className="absolute inset-0 grid place-content-center gap-3 px-4 text-center text-sm">
          <VideoOff className="mx-auto h-8 w-8 text-muted-foreground" />
          <p>{conn === "unavailable" ? "Live video service is not connected" : conn === "disconnected" ? "Stream disconnected — SOS remains active" : cam === "denied" ? "Camera permission was blocked" : publisher ? "Starting camera" : "Waiting for user camera"}</p>
          {canRetry && <button type="button" onClick={() => setAttempt(a => a + 1)} className="mx-auto inline-flex items-center gap-1.5 rounded-lg bg-paper px-3 py-1.5 text-xs font-bold text-ink"><RefreshCw className="h-3.5 w-3.5" />Retry</button>}
        </div>
      )}
      {live && <p className="absolute bottom-3 left-3 text-xs">{label ?? (camera === "back" ? "Back camera" : "Front camera")}</p>}
    </div>
  );
}
