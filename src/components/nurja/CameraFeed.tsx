import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/demo-store";
import { getVideoAccess } from "@/lib/video.functions";
import { VideoOff } from "lucide-react";

export function CameraFeed({ camera = "back", className, label, fit = "cover" }: { camera?: "back" | "front"; className?: string; label?: string; fit?: "cover" | "contain" }) {
  const d = useDemo();
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Connecting camera");
  const [live, setLive] = useState(false);
  useEffect(() => {
    const id = d.sos?.id;
    if (!id) return;
    let disposed = false;
    let room: import("livekit-client").Room | undefined;
    const connect = async () => {
      try {
        const access = await getVideoAccess({ data: { incidentId: id } });
        if (disposed) return;
        if (!access.configured) { setStatus("Live video service is not connected"); return; }
        const { Room, RoomEvent, Track } = await import("livekit-client");
        room = new Room();
        room.on(RoomEvent.TrackSubscribed, track => { if (track.kind === Track.Kind.Video && video.current) { track.attach(video.current); setLive(true); } });
        room.on(RoomEvent.TrackUnsubscribed, () => { setLive(false); setStatus("Camera disconnected"); });
        room.on(RoomEvent.Disconnected, () => { setLive(false); setStatus("Camera disconnected"); });
        await room.connect(access.url, access.token);
        if (disposed) { await room.disconnect(); return; }
        if (access.publisher) {
          await room.localParticipant.setCameraEnabled(true, { facingMode: camera === "back" ? "environment" : "user" });
          // Camera consent is requested by the browser; denied audio does not cancel SOS.
          await room.localParticipant.setMicrophoneEnabled(true).catch(() => {});
          const track = room.localParticipant.getTrackPublication(Track.Source.Camera)?.track;
          if (track && video.current) { track.attach(video.current); video.current.muted = true; setLive(true); }
        } else setStatus("Waiting for user camera");
      } catch { if (!disposed) { setStatus("Camera unavailable — SOS remains active"); setLive(false); } }
    };
    void connect();
    return () => { disposed = true; void room?.disconnect(); setLive(false); };
  }, [d.sos?.id, camera]);
  return (
    <div className={cn("relative min-h-40 overflow-hidden rounded-lg bg-ink text-paper", className)}>
      <video ref={video} autoPlay playsInline className={cn("absolute inset-0 h-full w-full", fit === "contain" ? "object-contain" : "object-cover")} />
      {!live && <div className="absolute inset-0 grid place-content-center gap-3 px-4 text-center text-sm"><VideoOff className="mx-auto h-8 w-8 text-muted-foreground" /><p>{status}</p></div>}
      {live && <span className="absolute left-3 top-3 rounded bg-crimson px-2 py-1 text-xs font-bold">Live</span>}
      {live && <p className="absolute bottom-3 left-3 text-xs">{label ?? (camera === "back" ? "Back camera" : "Front camera")}</p>}
    </div>
  );
}
