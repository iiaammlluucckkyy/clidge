import React from 'react';
import { TileLayer } from 'react-leaflet';
import { Layers, Globe, Map as MapIcon, Satellite } from 'lucide-react';

/**
 * Worldwide Leaflet Tile Layers + Floating Layer Switcher
 * Default: Esri World Imagery (Satellite) + Esri World Boundaries & Places Labels
 * Alternatives: Satellite Only (Esri) | Street Map (OpenStreetMap)
 */
export const WorldTileLayers = ({ mapStyle = 'satellite-labels' }) => {
  if (mapStyle === 'street') {
    return (
      <TileLayer
        key="osm-street"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxNativeZoom={19}
        maxZoom={21}
      />
    );
  }

  return (
    <>
      <TileLayer
        key="esri-imagery"
        attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxNativeZoom={19}
        maxZoom={21}
      />
      {mapStyle === 'satellite-labels' && (
        <TileLayer
          key="esri-labels"
          attribution="Labels &copy; Esri &mdash; Esri, Garmin, FAO, NOAA"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={19}
          maxZoom={21}
        />
      )}
    </>
  );
};

export const MapStyleSwitcher = ({ mapStyle, setMapStyle }) => {
  const options = [
    { id: 'satellite-labels', label: 'Satellite + Labels', icon: Globe },
    { id: 'satellite', label: 'Satellite', icon: Satellite },
    { id: 'street', label: 'Street', icon: MapIcon }
  ];

  return (
    <div className="bg-white/95 dark:bg-navy-950/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-navy-700 shadow-lg flex items-center gap-1 text-[11px] font-bold">
      <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 mx-1.5 hidden sm:block" />
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = mapStyle === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setMapStyle(opt.id)}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all whitespace-nowrap ${
              active
                ? 'bg-navy-950 dark:bg-cyan-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            <Icon className="w-3 h-3" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
