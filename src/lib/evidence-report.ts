import type { IncidentEvidence } from "./evidence";

async function toJpeg(src: string) {
  if (src.startsWith("data:image/jpeg")) return src;
  const blob = await (await fetch(src)).blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width; canvas.height = bitmap.height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export type CaseTimeline = { trail: { lat: number; lng: number; at: string }[]; responders: { name: string; code: string; state: string; assignedAt: string; arrivedAt: string | null; distanceKm: number }[] };
export type CaseSummary = { area?: string | undefined; date?: string | undefined; outcome?: string | undefined; duration?: string | undefined; timeline?: CaseTimeline | undefined };

/** Keeps at most `max` evenly spaced points, always including first and last. */
export function sampleTrail<T>(trail: T[], max: number): T[] {
  if (trail.length <= max) return trail;
  return Array.from({ length: max }, (_, i) => trail[Math.round((i * (trail.length - 1)) / (max - 1))]!);
}

export async function buildEvidenceReport(incidentId: string, records: IncidentEvidence[], lang: "en" | "bn", victim: string, summary: CaseSummary = {}) {
  const { PDFDocument } = await import("pdf-lib");
  if (lang === "bn") await document.fonts.load('400 26px "Noto Sans Bengali"', "০১২৩৪৫৬৭৮৯0123456789");
  await document.fonts.ready;
  const pdf = await PDFDocument.create();
  pdf.setTitle(`NURJA Evidence Report — ${incidentId}`);
  const bn = lang === "bn";
  const t = (en: string, bangla: string) => bn ? bangla : en;
  {
    const canvas = document.createElement("canvas");
    canvas.width = 1100;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Report rendering unavailable");
    const font = bn ? '"Noto Sans Bengali", "Hind Siliguri", sans-serif' : '"Manrope", sans-serif';
    const rows = [t("NURJA — Case Report", "নুর্জা — কেস রিপোর্ট"), `${t("Case", "কেস")}: ${incidentId}`, `${t("Victim", "ভুক্তভোগী")}: ${victim || "—"}`, `${t("Area", "এলাকা")}: ${summary.area || "—"}`, `${t("Date", "তারিখ")}: ${summary.date || "—"}`, `${t("Outcome", "ফলাফল")}: ${summary.outcome || "—"}`, `${t("Duration", "সময়কাল")}: ${summary.duration || "—"}`, `${t("Evidence frames", "প্রমাণ ফ্রেম")}: ${records.length}`, `${t("Generated", "তৈরি")}: ${new Date().toLocaleString(bn ? "bn-BD" : "en-GB")}`];
    canvas.height = 60 + rows.length * 48;
    const colors = getComputedStyle(document.documentElement);
    ctx.fillStyle = colors.getPropertyValue("--paper") || "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colors.getPropertyValue("--ink") || "#000";
    rows.forEach((row, i) => { ctx.font = `${i === 0 ? "bold 34px" : "26px"} ${font}`; ctx.fillText(row, 30, 50 + i * 48); });
    const img = await pdf.embedPng(canvas.toDataURL("image/png"));
    const h = img.height * 535 / img.width;
    pdf.addPage([595, 842]).drawImage(img, { x: 30, y: 842 - 40 - h, width: 535, height: h });
  }
  if (summary.timeline && (summary.timeline.trail.length || summary.timeline.responders.length)) {
    const tl = summary.timeline;
    const canvas = document.createElement("canvas"); canvas.width = 1100; canvas.height = 1556;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Report rendering unavailable");
    const font = bn ? '"Noto Sans Bengali", "Hind Siliguri", sans-serif' : '"Manrope", sans-serif';
    const colors = getComputedStyle(document.documentElement);
    const ink = colors.getPropertyValue("--ink") || "#000";
    ctx.fillStyle = colors.getPropertyValue("--paper") || "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ink;
    const time = (iso: string | null) => iso ? new Date(iso).toLocaleTimeString(bn ? "bn-BD" : "en-GB") : "—";
    let y = 50;
    const line = (text: string, size = 22, bold = false) => { ctx.font = `${bold ? "bold " : ""}${size}px ${font}`; ctx.fillText(text, 30, y); y += size + 14; };
    line(t("Responder timeline", "রেসপন্ডারের সময়রেখা"), 32, true);
    if (!tl.responders.length) line("—");
    for (const r of tl.responders) line(`${r.name} (${r.code}) · ${t("dispatched", "পাঠানো")} ${time(r.assignedAt)} · ${t("arrived", "পৌঁছেছে")} ${time(r.arrivedAt)} · ${r.distanceKm.toFixed(1)} km`);
    y += 10; line(`${t("Victim movement", "ভুক্তভোগীর চলাচল")} · ${tl.trail.length} ${t("points", "পয়েন্ট")}`, 32, true);
    if (tl.trail.length > 1) {
      const lats = tl.trail.map((p) => p.lat), lngs = tl.trail.map((p) => p.lng);
      const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
      const box = { x: 30, y, w: 1040, h: 420 };
      const span = Math.max(maxLat - minLat, maxLng - minLng, 0.0005);
      const px = (p: { lat: number; lng: number }) => [box.x + 20 + ((p.lng - minLng) / span) * (box.w - 40), box.y + box.h - 20 - ((p.lat - minLat) / span) * (box.h - 40)] as const;
      ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.strokeRect(box.x, box.y, box.w, box.h);
      ctx.strokeStyle = colors.getPropertyValue("--crimson") || "#E11D48"; ctx.lineWidth = 4; ctx.beginPath();
      tl.trail.forEach((p, i) => { const [a, b] = px(p); if (i) ctx.lineTo(a, b); else ctx.moveTo(a, b); }); ctx.stroke();
      ctx.fillStyle = ink; y += box.h + 30;
    }
    for (const p of sampleTrail(tl.trail, 20)) line(`${time(p.at)} · ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`, 20);
    const img = await pdf.embedPng(canvas.toDataURL("image/png"));
    pdf.addPage([595, 842]).drawImage(img, { x: 30, y: 30, width: 535, height: 782 });
  }
  for (const [index, record] of records.entries()) {
    const canvas = document.createElement("canvas");
    canvas.width = 1100;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Report rendering unavailable");
    const font = bn ? '"Noto Sans Bengali", "Hind Siliguri", sans-serif' : '"Manrope", sans-serif';
    context.font = `26px ${font}`;
    const lines: string[] = [];
    for (const value of [t("NURJA — Incident Evidence Report", "নুর্জা — ঘটনার প্রমাণ রিপোর্ট"), `${incidentId} · ${victim}`, `${t("Frame", "ফ্রেম")} ${index + 1} / ${records.length}`, `${t("Captured at", "ক্যাপচারের সময়")}: ${new Date(record.capturedAt).toLocaleString(bn ? "bn-BD" : "en-GB")}`, `${t("Responder", "রেসপন্ডার")}: ${record.responderName} · ${record.responderId}`, `${t("Camera", "ক্যামেরা")}: ${record.camera === "back" ? t("Back", "ব্যাক") : t("Front", "ফ্রন্ট")}`, `${t("Tags", "ট্যাগ")}: ${(record.tags ?? []).join(", ") || "—"}`]) {
      let line = "";
      for (const word of value.split(/\s+/)) {
        if (context.measureText(`${line} ${word}`).width > 1000 && line) { lines.push(line); line = ""; }
        // Break exceptionally long tags without clipping the report margin.
        for (const char of `${line ? " " : ""}${word}`) {
          if (context.measureText(line + char).width > 1000) { lines.push(line); line = ""; }
          line += char;
        }
      }
      lines.push(line);
    }
    canvas.height = 40 + lines.length * 42;
    const colors = getComputedStyle(document.documentElement);
    context.fillStyle = colors.getPropertyValue("--paper");
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = colors.getPropertyValue("--ink");
    context.font = `26px ${font}`;
    lines.forEach((line, i) => context.fillText(line, 30, 40 + i * 42));
    const header = await pdf.embedPng(canvas.toDataURL("image/png"));
    const image = await pdf.embedJpg(await toJpeg(record.src));
    const width = 595;
    const headerHeight = header.height * 535 / header.width;
    const imageHeight = Math.min(450, image.height * 535 / image.width);
    const height = Math.max(842, headerHeight + imageHeight + 90);
    const page = pdf.addPage([width, height]);
    page.drawImage(header, { x: 30, y: height - 30 - headerHeight, width: 535, height: headerHeight });
    const imageWidth = image.width * imageHeight / image.height;
    page.drawImage(image, { x: (width - imageWidth) / 2, y: height - 50 - headerHeight - imageHeight, width: imageWidth, height: imageHeight });
  }
  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

export async function deliverEvidenceReport(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}