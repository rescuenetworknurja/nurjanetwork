/** Generated siren tone (Web Audio) — no audio file to download or store. */
export function startSiren(): () => void {
  const AC = typeof window !== "undefined" ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) : undefined;
  if (!AC) return () => {};
  const ctx = new AC();
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.type = "sawtooth"; gain.gain.value = 0.15; osc.connect(gain).connect(ctx.destination);
  let up = true;
  const sweep = () => { const t = ctx.currentTime; osc.frequency.cancelScheduledValues(t); osc.frequency.linearRampToValueAtTime(up ? 1200 : 650, t + 0.6); up = !up; };
  osc.frequency.value = 650; osc.start(); sweep();
  const timer = setInterval(sweep, 600);
  void ctx.resume().catch(() => {});
  return () => { clearInterval(timer); try { osc.stop(); } catch { /* already stopped */ } void ctx.close().catch(() => {}); };
}
