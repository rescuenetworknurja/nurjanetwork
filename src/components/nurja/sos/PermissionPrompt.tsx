import { useEffect, useState } from "react";
import { Camera, MapPin, Bell, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rememberPosition } from "@/lib/device-location";

const KEY = "nurja-permissions-asked";

async function requestAll() {
  const results: string[] = [];
  try {
    navigator.geolocation?.getCurrentPosition(rememberPosition, () => {}, { enableHighAccuracy: true, timeout: 15000 });
  } catch { /* ignore */ }
  try {
    const s = await navigator.mediaDevices?.getUserMedia({ video: true, audio: true });
    s?.getTracks().forEach(t => t.stop());
  } catch { results.push("camera"); }
  try { if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission(); } catch { /* ignore */ }
  return results;
}

/** Asks for location, camera, microphone and notifications as soon as a signed-in user opens the app. */
export function PermissionPrompt() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const needs = async () => {
      const notif = "Notification" in window && Notification.permission === "default";
      let media = true;
      try {
        const [c, m, g] = await Promise.all((["camera", "microphone", "geolocation"] as PermissionName[]).map(n => navigator.permissions.query({ name: n })));
        media = [c, m, g].some(p => p?.state !== "granted");
        if (g?.state === "granted") navigator.geolocation.getCurrentPosition(rememberPosition, () => {}, { maximumAge: 60000 });
      } catch { media = !sessionStorage.getItem(KEY); }
      if (notif || media) {
        // Chrome allows asking right away; the card stays as a tap-to-allow fallback (needed on iPhone).
        void requestAll().finally(() => { sessionStorage.setItem(KEY, "1"); });
        setOpen(true);
      }
    };
    void needs();
  }, []);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[700] flex items-end justify-center bg-foreground/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-lg bg-card p-5 shadow-lg">
        <p className="font-display text-lg font-extrabold">Allow emergency access</p>
        <p className="mt-1 text-sm text-muted-foreground">SOS needs these so responders can find and see you.</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-crimson" />Location</li>
          <li className="flex items-center gap-2"><Camera className="h-4 w-4 text-crimson" />Camera</li>
          <li className="flex items-center gap-2"><Mic className="h-4 w-4 text-crimson" />Microphone</li>
          <li className="flex items-center gap-2"><Bell className="h-4 w-4 text-crimson" />Notifications</li>
        </ul>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Later</Button>
          <Button className="flex-1 bg-crimson text-paper hover:bg-crimson/90" onClick={() => { void requestAll().finally(() => setOpen(false)); }}>Allow</Button>
        </div>
      </div>
    </div>
  );
}
