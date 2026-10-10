import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import L from "leaflet";
import { getResolvedTheme, useTheme } from "@/hooks/use-theme";

type P = { id: string; name: string; lat: number; lng: number; score: number };

const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

export default function PlacesMap({
  places,
  className,
  activePlaceId,
  onSelectPlace,
}: {
  places: P[];
  className?: string;
  activePlaceId?: string | null;
  onSelectPlace?: (id: string) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    if (!el.current || map.current) return;
    const container = el.current;
    const initialDark = getResolvedTheme() === "dark";
    map.current = L.map(container, { zoomControl: true }).setView([13.5, 77], 5);
    tileLayer.current = L.tileLayer(initialDark ? DARK_TILES : LIGHT_TILES, {
      attribution: "© OpenStreetMap © CARTO",
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);

    const invalidate = () => {
      requestAnimationFrame(() => {
        map.current?.invalidateSize();
      });
    };
    invalidate();
    const timer = setTimeout(invalidate, 200);

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => invalidate()) : null;
    ro?.observe(container);
    window.addEventListener("resize", invalidate);

    return () => {
      clearTimeout(timer);
      ro?.disconnect();
      window.removeEventListener("resize", invalidate);
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
      const isActive = activePlaceId === p.id;
      L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: "",
          html: `<span class="score-pin ${isActive ? "score-pin-active" : ""}">${i < 3 ? "🔥 " : ""}${p.score}</span>`,
          iconSize: [0, 0],
        }),
        zIndexOffset: isActive ? 2500 : 1000 - i,
        title: p.name,
      })
        .on("click", () => {
          if (onSelectPlace && typeof window !== "undefined" && window.innerWidth >= 1024) {
            onSelectPlace(p.id);
            map.current?.panTo([p.lat, p.lng], { animate: true });
          } else {
            navigate({ to: "/place/$id", params: { id: p.id } });
          }
        })
        .addTo(layer.current!);
    });
  }, [places, navigate, activePlaceId, onSelectPlace]);

  return <div ref={el} className={className} />;
}
