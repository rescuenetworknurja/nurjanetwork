import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import { MAP_CENTER, toLatLng, toXY, zoneMeters } from "@/lib/geo-map";
import type { Zone } from "@/lib/mock-data";
import type { MapUnit } from "./TacticalMap";

const zoneColor = (r: number) => (r >= 5 ? "var(--zone-5)" : r >= 4 ? "#e11d48" : r >= 3 ? "var(--zone-3)" : r >= 2 ? "#f59e0b" : "var(--zone-1)");

const GLYPHS: Record<MapUnit["kind"], string> = {
  patrol: "M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13v5h-2v-2H5v2H3v-5zm3.4-4L5.6 12h12.8l-.8-3H6.4zM7 14.5A1.5 1.5 0 1 0 7 17.5 1.5 1.5 0 0 0 7 14.5zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z",
  fari: "M12 2a7 7 0 0 0-7 7v3H4v4h3a5 5 0 0 0 10 0h3v-4h-1V9a7 7 0 0 0-7-7zm0 2a5 5 0 0 1 5 5v1H7V9a5 5 0 0 1 5-5z",
  station: "M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16h4v2H2v-2h2zm4-12h2v2H8V9zm4 0h2v2h-2V9zM8 13h2v2H8v-2zm4 0h2v2h-2v-2z",
  volunteer: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-8 2-8 5v3h16v-3c0-3-4-5-8-5z",
  officer: "M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z",
  self: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-8 2-8 5v3h16v-3c0-3-4-5-8-5z",
};

const unitTone = (kind: MapUnit["kind"]) =>
  kind === "volunteer" ? "var(--emerald)" : kind === "self" ? "var(--plum)" : "var(--navy)";

function unitIcon(u: MapUnit) {
  const size = u.kind === "volunteer" ? 22 : 30;
  const pulse = u.gps === "live" && u.kind !== "volunteer";
  const tag =
    u.gps && u.kind !== "volunteer" && u.kind !== "self"
      ? `<div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:${u.eta !== undefined ? 14 : 2}px;white-space:nowrap;border-radius:4px;padding:0 4px;font-size:8px;font-weight:800;letter-spacing:.04em;background:${u.gps === "fixed" ? "rgba(15,23,42,.9)" : "rgba(225,29,72,.9)"};color:#fff">${u.gps === "fixed" ? "📍 FIXED" : "📡 LIVE"}</div>`
      : "";
  const eta =
    u.eta !== undefined && u.kind !== "volunteer"
      ? `<div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:2px;white-space:nowrap;border-radius:4px;padding:0 4px;font-size:9px;font-weight:700;background:rgba(15,23,42,.85);color:#fff">${u.eta} min</div>`
      : "";
  return L.divIcon({
    className: "nurja-map-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="position:relative;width:${size}px;height:${size}px">
      ${pulse ? `<span style="position:absolute;inset:0;border-radius:9999px;background:rgba(225,29,72,.4);animation:nurja-ripple 2s infinite"></span>` : ""}
      <div style="position:relative;display:grid;place-items:center;width:100%;height:100%;border-radius:9999px;border:2px solid #fff;background:${unitTone(u.kind)};box-shadow:0 2px 6px rgba(0,0,0,.35)">
        <svg viewBox="0 0 24 24" width="${size * 0.55}" height="${size * 0.55}" fill="#fff"><path d="${GLYPHS[u.kind]}"/></svg>
      </div>${tag}${eta}
    </div>`,
  });
}

const victimIcon = L.divIcon({
  className: "nurja-map-icon",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  html: `<div style="position:relative;width:34px;height:34px">
    <span style="position:absolute;inset:0;border-radius:9999px;background:var(--crimson);animation:nurja-ripple 2s infinite"></span>
    <span style="position:absolute;inset:0;border-radius:9999px;background:var(--crimson);animation:nurja-ripple 2s infinite;animation-delay:1.2s"></span>
    <div style="position:relative;display:grid;place-items:center;width:100%;height:100%;border-radius:9999px;border:2px solid #fff;background:var(--crimson);box-shadow:0 0 18px rgba(225,29,72,.6)">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="#fff"><path d="${GLYPHS.fari}"/></svg>
    </div>
  </div>`,
});

const meIcon = L.divIcon({
  className: "nurja-map-icon", iconSize: [22, 22], iconAnchor: [11, 11],
  html: `<div style="position:relative;width:22px;height:22px"><span style="position:absolute;inset:0;border-radius:9999px;background:rgba(37,99,235,.35);animation:nurja-ripple 2s infinite"></span><div style="position:relative;width:100%;height:100%;border-radius:9999px;border:3px solid #fff;background:#2563eb;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div></div>`,
});
const pinIcon = (bg: string) => L.divIcon({
  className: "nurja-map-icon", iconSize: [18, 18], iconAnchor: [9, 9],
  html: `<div style="width:18px;height:18px;border-radius:9999px;border:3px solid #fff;background:${bg};box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
});

function FitTo({ points, focus }: { points?: [number, number][] | undefined; focus?: [number, number] | undefined }) {
  const map = useMap();
  const key = points?.length ? `${points[0]}|${points[points.length - 1]}|${points.length}` : "";
  useEffect(() => {
    if (points && points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], paddingTopLeft: [40, 140], paddingBottomRight: [40, 280] });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const fk = focus ? `${focus[0].toFixed(4)},${focus[1].toFixed(4)}` : "";
  useEffect(() => { if (focus && !(points && points.length > 1)) map.setView(focus, 15); }, [fk]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// Leaflet measures its box once; maps opened inside animated dialogs need re-measuring
// or tiles and pins drift apart from their real coordinates.
function KeepSized() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    const t = window.setTimeout(() => map.invalidateSize(), 350);
    return () => { ro.disconnect(); window.clearTimeout(t); };
  }, [map]);
  return null;
}

function FocusPoint({ point }: { point?: [number, number] | undefined }) {
  const map = useMap();
  const k = point ? `${point[0].toFixed(6)},${point[1].toFixed(6)}` : "";
  useEffect(() => { if (point) map.setView(point, Math.max(map.getZoom(), 16)); }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function ClickHandler({ onMapClick }: { onMapClick: (x: number, y: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { x, y } = toXY(e.latlng.lat, e.latlng.lng);
      onMapClick(x, y);
    },
  });
  return null;
}

export default function LiveMap({
  zones = [], victim, units = [], route, routeTone = "emerald", onMapClick, selectedZone, showLabels = false, path, me, endpoints, center, focusPoint,
}: {
  center?: [number, number] | undefined; focusPoint?: [number, number] | undefined;
  path?: [number, number][] | undefined; me?: [number, number] | undefined; endpoints?: [[number, number], [number, number]] | undefined;
  zones?: Zone[] | undefined; victim?: { x: number; y: number } | undefined; units?: MapUnit[] | undefined;
  route?: [number, number][] | undefined; routeTone?: "emerald" | "crimson";
  onMapClick?: ((x: number, y: number) => void) | undefined; selectedZone?: string | undefined; showLabels?: boolean;
}) {
  return (
    <MapContainer center={center ?? MAP_CENTER} zoom={center ? 14 : 13} className="h-full w-full" style={{ height: "100%", width: "100%" }} attributionControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onMapClick && <ClickHandler onMapClick={onMapClick} />}
      {zones.map((z) => (
        <Circle
          key={z.id}
          center={toLatLng(z.x, z.y)}
          radius={zoneMeters(z)}
          pathOptions={{
            color: selectedZone === z.id ? "var(--amber)" : zoneColor(z.rating),
            weight: selectedZone === z.id ? 2 : 1,
            dashArray: selectedZone === z.id ? "6 4" : undefined,
            fillColor: zoneColor(z.rating),
            fillOpacity: 0.18 + z.rating * 0.04,
          }}
        >
          {showLabels && (
            <Marker
              position={toLatLng(z.x, z.y)}
              interactive={false}
              icon={L.divIcon({
                className: "nurja-map-icon",
                iconSize: [0, 0],
                html: `<span style="white-space:nowrap;border-radius:4px;background:rgba(255,255,255,.85);padding:0 4px;font-size:10px;font-weight:600;color:#0f172a">${z.name} · ${z.rating}</span>`,
              })}
            />
          )}
        </Circle>
      ))}
      {route && (
        <>
          <Polyline positions={route.map((p) => toLatLng(p[0], p[1]))} pathOptions={{ color: `var(--${routeTone})`, weight: 7, opacity: 0.25, lineJoin: "round" }} />
          <Polyline positions={route.map((p) => toLatLng(p[0], p[1]))} pathOptions={{ color: `var(--${routeTone})`, weight: 3, dashArray: "10 8", lineJoin: "round" }} />
        </>
      )}
      {victim &&
        units
          .filter((u) => u.kind !== "volunteer")
          .map((u) => (
            <Polyline key={`l${u.id}`} positions={[toLatLng(u.x, u.y), toLatLng(victim.x, victim.y)]} pathOptions={{ color: "var(--crimson)", weight: 1, dashArray: "4 4", opacity: 0.6 }} />
          ))}
      {units.map((u) => (
        <Marker key={u.id} position={toLatLng(u.x, u.y)} icon={unitIcon(u)} />
      ))}
      {victim && <Marker position={toLatLng(victim.x, victim.y)} icon={victimIcon} zIndexOffset={1000} />}
      {path && path.length > 1 && (
        <>
          <Polyline positions={path} pathOptions={{ color: routeTone === "crimson" ? "#e11d48" : "#10b981", weight: 9, opacity: 0.3, lineJoin: "round" }} />
          <Polyline positions={path} pathOptions={{ color: routeTone === "crimson" ? "#be123c" : "#059669", weight: 4, lineJoin: "round" }} />
        </>
      )}
      {endpoints && <><Marker position={endpoints[0]} icon={pinIcon("#0f172a")} /><Marker position={endpoints[1]} icon={pinIcon("#10b981")} /></>}
      {me && <Marker position={me} icon={meIcon} zIndexOffset={2000} />}
      <KeepSized />
      <FocusPoint point={focusPoint} />
      <FitTo points={path} focus={me ?? (victim ? toLatLng(victim.x,victim.y) : units[0] ? toLatLng(units[0].x,units[0].y) : undefined)} />
    </MapContainer>
  );
}
