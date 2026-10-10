import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import L from "leaflet";
import { getResolvedTheme, useTheme } from "@/hooks/use-theme";

type P = { id: string; name: string; lat: number; lng: number; score: number };

const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

export default function PlacesMap({ places, className }: { places: P[]; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    if (!el.current || map.current) return;
    const initialDark = getResolvedTheme() === "dark";
    map.current = L.map(el.current, { zoomControl: false }).setView([13.5, 77], 5);
    tileLayer.current = L.tileLayer(initialDark ? DARK_TILES : LIGHT_TILES, {
      attribution: "© OpenStreetMap © CARTO",
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
      tileLayer.current = null;
      layer.current = null;
    };
  }, []);

  useEffect(() => {
    if (!tileLayer.current) return;
    tileLayer.current.setUrl(isDark ? DARK_TILES : LIGHT_TILES);
  }, [isDark]);

  useEffect(() => {
    if (!layer.current) return;
    layer.current.clearLayers();
    places.forEach((p, i) => {
      L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: "",
          html: `<span class="score-pin">${i < 3 ? "🔥 " : ""}${p.score}</span>`,
          iconSize: [0, 0],
        }),
        zIndexOffset: 1000 - i,
        title: p.name,
      })
        .on("click", () => navigate({ to: "/place/$id", params: { id: p.id } }))
        .addTo(layer.current!);
    });
  }, [places, navigate]);

  return <div ref={el} className={className} />;
}
