import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import L from "leaflet";
import { Building2, Globe, Layers, Map as MapIcon, Navigation, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlaceMapItem = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  score?: number;
  image?: string;
  region?: string;
};

// Google Hybrid: Satellite + Roads + Building Icons + English/Malayalam Place Labels (Matches exact screenshot)
const GOOGLE_HYBRID_TILES = "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";
// Google Streets: Detailed 3D-shaded building footprints + all shop/building labels
const GOOGLE_STREETS_TILES = "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
// Google Clean Satellite
const GOOGLE_SATELLITE_TILES = "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
// OpenStreetMap
const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export type MapLayerType = "hybrid" | "streets" | "satellite" | "osm";

export interface PlacesMapProps {
  places: PlaceMapItem[];
  className?: string;
  activePlaceId?: string | null;
  onSelectPlace?: (id: string) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  defaultLayer?: MapLayerType;
  showLayerControls?: boolean;
  showZoomControls?: boolean;
  autoZoomOnSelect?: boolean;
}

export default function PlacesMap({
  places,
  className,
  activePlaceId,
  onSelectPlace,
  initialCenter = [10.25, 76.5],
  initialZoom = 8,
  defaultLayer = "hybrid",
  showLayerControls = true,
  showZoomControls = true,
  autoZoomOnSelect = true,
}: PlacesMapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const baseTileLayer = useRef<L.TileLayer | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const [layerType, setLayerType] = useState<MapLayerType>(defaultLayer);
  const [currentZoom, setCurrentZoom] = useState<number>(initialZoom);

  const navigate = useNavigate();

  const getTileConfig = useCallback((type: MapLayerType) => {
    switch (type) {
      case "hybrid":
        return {
          url: GOOGLE_HYBRID_TILES,
          options: {
            attribution: "© Google Maps (Satellite & Buildings)",
            maxZoom: 21,
            maxNativeZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
          },
        };
      case "streets":
        return {
          url: GOOGLE_STREETS_TILES,
          options: {
            attribution: "© Google Maps (Buildings & Streets)",
            maxZoom: 21,
            maxNativeZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
          },
        };
      case "satellite":
        return {
          url: GOOGLE_SATELLITE_TILES,
          options: {
            attribution: "© Google Maps Satellite",
            maxZoom: 21,
            maxNativeZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
          },
        };
      case "osm":
      default:
        return {
          url: OSM_TILES,
          options: {
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
            maxZoom: 19,
            subdomains: ["a", "b", "c"],
          },
        };
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!el.current || map.current) return;
    const container = el.current;

    const m = L.map(container, {
      zoomControl: true,
      maxZoom: 21,
    }).setView(initialCenter, initialZoom);
    map.current = m;

    m.on("zoomend", () => {
      setCurrentZoom(m.getZoom());
    });

    const config = getTileConfig(layerType);
    baseTileLayer.current = L.tileLayer(config.url, config.options).addTo(m);
    markersLayer.current = L.layerGroup().addTo(m);

    const invalidate = () => {
      requestAnimationFrame(() => {
        m.invalidateSize();
      });
    };
    invalidate();
    const timer = setTimeout(invalidate, 250);

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => invalidate()) : null;
    ro?.observe(container);
    window.addEventListener("resize", invalidate);

    return () => {
      clearTimeout(timer);
      ro?.disconnect();
      window.removeEventListener("resize", invalidate);
      m.remove();
      map.current = null;
      baseTileLayer.current = null;
      markersLayer.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Tile Layer when layerType changes
  useEffect(() => {
    if (!map.current) return;
    const config = getTileConfig(layerType);

    if (baseTileLayer.current) {
      map.current.removeLayer(baseTileLayer.current);
    }
    baseTileLayer.current = L.tileLayer(config.url, config.options).addTo(map.current);
  }, [layerType, getTileConfig]);

  // Update Markers
  useEffect(() => {
    if (!markersLayer.current || !map.current) return;
    markersLayer.current.clearLayers();

    places.forEach((p, i) => {
      const isActive = activePlaceId === p.id;
      const score = p.score ?? 85;

      const tierClass =
        score >= 90
          ? "score-pin-top"
          : score >= 85
            ? "score-pin-high"
            : score >= 80
              ? "score-pin-mid"
              : "score-pin-low";

      const tierHex =
        score >= 90 ? "#10b981" : score >= 85 ? "#0ea5e9" : score >= 80 ? "#f59e0b" : "#ef4444";

      const tierIcon = score >= 90 ? "🔥" : score >= 85 ? "⚡" : score >= 80 ? "⭐" : "🏢";

      const markerHtml = `
        <div class="group flex items-center justify-center transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110">
          <div class="score-pin ${tierClass} ${isActive ? "score-pin-active" : ""}">
            <span class="text-[11px] leading-none">${tierIcon}</span>
            <span class="font-bold tracking-tight">${score}</span>
          </div>
        </div>
      `;

      const marker = L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: "leaflet-place-marker",
          html: markerHtml,
          iconSize: [0, 0],
        }),
        zIndexOffset: isActive ? 2500 : 1000 - i,
        title: `${p.name} (Score: ${score})`,
      });

      const popupHtml = `
        <div style="min-width: 215px; font-family: var(--font-sans, sans-serif); padding: 8px;">
          ${
            p.image
              ? `<div style="width: 100%; height: 96px; border-radius: 10px; overflow: hidden; margin-bottom: 8px; position: relative;">
                  <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                  <span style="position: absolute; top: 6px; right: 6px; background: ${tierHex}; color: white; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.35);">
                    ${tierIcon} ${score}
                  </span>
                </div>`
              : ""
          }
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">${p.name}</div>
          <div style="font-size: 11px; opacity: 0.75; margin-bottom: 8px;">📍 ${p.region ?? "India"}</div>
          <div style="display: flex; gap: 6px;">
            <button id="btn-zoom-building-${p.id}" style="flex: 1; background: ${tierHex}; color: white; border: none; border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">
              🏢 Zoom Building
            </button>
            <button id="btn-view-place-${p.id}" style="background: rgba(128,128,128,0.18); border: none; border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">
              Details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: "custom-leaflet-building-popup",
        maxWidth: 260,
      });

      marker.on("popupopen", () => {
        const zoomBtn = document.getElementById(`btn-zoom-building-${p.id}`);
        if (zoomBtn) {
          zoomBtn.onclick = (e) => {
            e.stopPropagation();
            map.current?.flyTo([p.lat, p.lng], 18, { duration: 1.2 });
          };
        }
        const viewBtn = document.getElementById(`btn-view-place-${p.id}`);
        if (viewBtn) {
          viewBtn.onclick = (e) => {
            e.stopPropagation();
            navigate({ to: "/place/$id", params: { id: p.id } });
          };
        }
      });

      marker.on("click", () => {
        if (onSelectPlace && typeof window !== "undefined" && window.innerWidth >= 1024) {
          onSelectPlace(p.id);
          if (autoZoomOnSelect && map.current) {
            const nextZoom = Math.max(map.current.getZoom(), 17);
            map.current.flyTo([p.lat, p.lng], nextZoom, { duration: 1.2 });
          }
        } else {
          marker.openPopup();
        }
      });

      marker.addTo(markersLayer.current!);
    });
  }, [places, navigate, activePlaceId, onSelectPlace, autoZoomOnSelect]);

  // Smoothly pan & zoom to active place when selected from list
  useEffect(() => {
    if (!activePlaceId || !map.current) return;
    const target = places.find((p) => p.id === activePlaceId);
    if (target) {
      const zoom = autoZoomOnSelect ? Math.max(map.current.getZoom(), 17) : map.current.getZoom();
      map.current.flyTo([target.lat, target.lng], zoom, { duration: 1.2 });
    }
  }, [activePlaceId, places, autoZoomOnSelect]);

  const handleFocusBuilding = () => {
    if (!map.current) return;
    const active = places.find((p) => p.id === activePlaceId) || places[0];
    if (active) {
      map.current.flyTo([active.lat, active.lng], 18, { duration: 1.2 });
    }
  };

  const handleResetView = () => {
    if (!map.current) return;
    map.current.flyTo(initialCenter, initialZoom, { duration: 1.2 });
  };

  const isBuildingZoom = currentZoom >= 16;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div ref={el} className="size-full" />

      {/* Top Layer Switcher Control */}
      {showLayerControls && (
        <div className="pointer-events-auto absolute right-3 top-3 z-[1000] flex max-w-[calc(100%-4rem)] flex-wrap items-center gap-1 rounded-full border border-border/80 bg-card/90 p-1 shadow-card backdrop-blur-md">
          <button
            type="button"
            onClick={() => setLayerType("hybrid")}
            title="Satellite + Roads + Building Names (Malayalam & English)"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
              layerType === "hybrid"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Building2 size={13} />
            <span>Hybrid Buildings</span>
          </button>

          <button
            type="button"
            onClick={() => setLayerType("streets")}
            title="Detailed Building Shapes & Street Labels"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
              layerType === "streets"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <MapIcon size={13} />
            <span>Streets</span>
          </button>

          <button
            type="button"
            onClick={() => setLayerType("satellite")}
            title="Pure Satellite View"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
              layerType === "satellite"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Globe size={13} />
            <span>Satellite</span>
          </button>

          <button
            type="button"
            onClick={() => setLayerType("osm")}
            title="OpenStreetMap"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
              layerType === "osm"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Layers size={13} />
            <span>OSM</span>
          </button>
        </div>
      )}

      {/* Bottom Right Quick Building Zoom Controls */}
      {showZoomControls && (
        <div className="pointer-events-auto absolute bottom-5 right-3 z-[1000] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleFocusBuilding}
            title="Zoom close to see buildings & Malayalam labels (Zoom 18)"
            className={cn(
              "tap-scale flex items-center gap-1.5 rounded-full border border-border/70 bg-card/95 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-card backdrop-blur-md transition-all hover:bg-muted",
              isBuildingZoom && "border-teal text-teal ring-1 ring-teal/30",
            )}
          >
            <Building2 size={14} className={isBuildingZoom ? "text-teal" : "text-primary"} />
            <span>{isBuildingZoom ? "Building View Active" : "Zoom to Buildings"}</span>
          </button>

          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={handleResetView}
              title="Reset Map View"
              className="tap-scale flex items-center gap-1 rounded-full border border-border/70 bg-card/95 px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-card backdrop-blur-md hover:text-foreground"
            >
              <Navigation size={11} />
              <span>Reset View</span>
            </button>
            <div className="flex items-center rounded-full border border-border/70 bg-card/95 px-2 py-1 text-[10px] font-mono text-muted-foreground shadow-card backdrop-blur-md">
              Z:{Math.round(currentZoom)}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Left Score Legend */}
      <div className="pointer-events-none absolute bottom-5 left-3 z-[1000] flex flex-col gap-1.5">
        {isBuildingZoom && (
          <div className="hidden items-center gap-1.5 rounded-full border border-border/80 bg-card/90 px-3 py-1 text-[11px] font-medium text-foreground shadow-2xs backdrop-blur-md sm:flex">
            <Sparkles size={12} className="text-teal" />
            <span>Buildings, roads & local labels visible</span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3 py-1 text-[11px] font-semibold text-foreground shadow-card backdrop-blur-md">
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span>90+</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-sky-500" />
            <span>85–89</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span>80–84</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-rose-500" />
            <span>&lt;80</span>
          </span>
        </div>
      </div>
    </div>
  );
}
