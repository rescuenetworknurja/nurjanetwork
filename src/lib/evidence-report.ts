import type { IncidentEvidence } from "./evidence";

export async function buildEvidenceReport(incidentId: string, records: IncidentEvidence[], lang: "en" | "bn", victim: string) {
  const { PDFDocument } = await import("pdf-lib");
  await document.fonts.ready;
  const pdf = await PDFDocument.create();
  pdf.setTitle(`NURJA Evidence Report — ${incidentId}`);
  const bn = lang === "bn";
  const t = (en: string, bangla: string) => bn ? bangla : en;
  for (const [index, record] of records.entries()) {
    const canvas = document.createElement("canvas");
    canvas.width = 1100;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Report rendering unavailable");
    const font = bn ? '"Hind Siliguri", sans-serif' : '"Manrope", sans-serif';
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
    const image = record.src.startsWith("data:image/jpeg") ? await pdf.embedJpg(record.src) : await pdf.embedPng(record.src);
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