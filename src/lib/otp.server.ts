const GATEWAY = "https://connector-gateway.lovable.dev/udc_bulksmsbd";

export async function hashCode(phone: string, code: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${phone}:${code}:nurja`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function makeCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0]! % 1_000_000;
  return n.toString().padStart(6, "0");
}

export async function sendSms(number: string, message: string): Promise<void> {
  const lovable = process.env["LOVABLE_API_KEY"];
  const conn = process.env["UDC_BULKSMSBD_API_KEY"];
  if (!lovable || !conn) throw new Error("SMS service is not configured");
  const q = new URLSearchParams({ type: "text", number, message });
  const sender = process.env["BULKSMSBD_SENDER_ID"];
  if (sender) q.set("senderid", sender);
  const res = await fetch(`${GATEWAY}/api/smsapi?${q}`, {
    headers: { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": conn },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`SMS failed [${res.status}]: ${body}`);
  let code: number | undefined;
  try { code = JSON.parse(body).response_code; } catch { /* ignore */ }
  if (code !== 202) throw new Error(`SMS failed: ${body}`);
}
