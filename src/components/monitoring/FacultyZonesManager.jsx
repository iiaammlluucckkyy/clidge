import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  PlusCircle,
  Trash2,
  Crosshair,
  AlertCircle,
  CheckCircle2,
  LocateFixed,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { createCollegeZone, deleteCollegeZone } from '../../services/zoneService';
import { WorldTileLayers, MapStyleSwitcher } from '../map/WorldMapLayerSwitcher';
import Button from '../common/Button';

const WORLD_CENTER = [20, 0];

const ZONE_COLORS = [
  { label: 'Cyan', hex: '#06b6d4' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Orange (Canteen)', hex: '#f97316' },
  { label: 'Pink (Hostel)', hex: '#ec4899' },
  { label: 'Violet', hex: '#8b5cf6' },
  { label: 'Amber', hex: '#f59e0b' }
];

const MapClickHandler = ({ onSelectPoint }) => {
  useMapEvents({
    click(e) {
      onSelectPoint(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const FlyToHelper = ({ target }) => {
  const map = useMap();
  const lastRef = useRef('');
  useEffect(() => {
    if (!target) return;
    const key = `${target.lat.toFixed(5)},${target.lng.toFixed(5)},${target.zoom}`;
    if (lastRef.current !== key) {
      lastRef.current = key;
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.0 });
    }
  }, [target, map]);
  return null;
};

const createZoneIcon = (name, color = '#06b6d4', isDraft = false) =>
  L.divIcon({
    className: 'custom-zone-pin',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
        <div style="background:${isDraft ? '#f59e0b' : '#0f172a'};color:${isDraft ? '#ffffff' : color};border:1.5px solid ${color};padding:3px 8px;border-radius:8px;font-size:10px;font-weight:800;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.45);">
          ${isDraft ? '📌 New Zone' : `📍 ${name}`}
        </div>
        <div style="width:10px;height:10px;background:${color};border:2px solid white;border-radius:50%;margin-top:2px;"></div>
      </div>
    `,
    iconSize: [0, 0]
  });

export const FacultyZonesManager = () => {
  const { currentUser } = useAuth();
  const { collegeZones, previewCoordinates, centerOnMyGps } = useLocation();

  const [mapStyle, setMapStyle] = useState('satellite-labels');
  const [flyTarget, setFlyTarget] = useState(null);

  const [draftName, setDraftName] = useState('');
  const [draftRadius, setDraftRadius] = useState(60);
  const [draftColor, setDraftColor] = useState('#06b6d4');
  const [pickedCoords, setPickedCoords] = useState(null);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-center once on faculty GPS or existing zone if available
  const initialCenter = previewCoordinates
    ? [previewCoordinates.lat, previewCoordinates.lng]
    : collegeZones.length > 0
    ? [Number(collegeZones[0].latitude), Number(collegeZones[0].longitude)]
    : WORLD_CENTER;
  const initialZoom = previewCoordinates || collegeZones.length > 0 ? 17 : 2;

  const handleUseMyGps = async () => {
    setErrorMsg('');
    try {
      const coords = await centerOnMyGps();
      setPickedCoords({ lat: coords.lat, lng: coords.lng });
      setFlyTarget({ lat: coords.lat, lng: coords.lng, zoom: 18 });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSaveZone = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!pickedCoords) {
      setErrorMsg('Tap on the satellite map (Hostel, Canteen, Classroom, etc.) or click "Use my GPS" first.');
      return;
    }
    if (!draftName.trim()) {
      setErrorMsg('Please enter a name for this place.');
      return;
    }

    setSaving(true);
    try {
      await createCollegeZone(
        {
          name: draftName.trim(),
          latitude: pickedCoords.lat,
          longitude: pickedCoords.lng,
          radius: Number(draftRadius) || 60,
          color: draftColor
        },
        currentUser
      );
      setSuccessMsg(`Saved zone "${draftName.trim()}" (${draftRadius}m radius).`);
      setDraftName('');
      setPickedCoords(null);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    setErrorMsg('');
    try {
      await deleteCollegeZone(zoneId, currentUser);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-navy-800 shadow-card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-navy-950 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-600" /> Campus Zones Builder
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Zoom into your college on the Satellite map, <strong>tap the real building</strong> (Hostel, Canteen, Library, Classroom), set radius, and save. A new college starts with 0 zones.
          </p>
        </div>

        <Button type="button" variant="cyan" size="sm" icon={LocateFixed} onClick={handleUseMyGps}>
          Use my GPS position
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Interactive Satellite Map */}
        <div className="lg:col-span-8 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-card overflow-hidden">
          <div className="p-3 border-b border-slate-100 dark:border-navy-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-navy-900 dark:text-white">
              Tap anywhere on the map to mark a place
            </span>
            <MapStyleSwitcher mapStyle={mapStyle} setMapStyle={setMapStyle} />
          </div>

          <div className="h-[420px] sm:h-[480px] w-full relative">
            <MapContainer
              center={initialCenter}
              zoom={initialZoom}
              maxZoom={21}
              scrollWheelZoom={true}
              className="h-full w-full cursor-crosshair z-0"
            >
              <MapClickHandler onSelectPoint={(lat, lng) => setPickedCoords({ lat, lng })} />
              <FlyToHelper target={flyTarget} />
              <WorldTileLayers mapStyle={mapStyle} />

              {/* Existing College Zones */}
              {collegeZones.map((zone) => (
                <React.Fragment key={zone.id}>
                  <Circle
                    center={[Number(zone.latitude), Number(zone.longitude)]}
                    radius={Number(zone.radius) || 60}
                    pathOptions={{
                      color: zone.color || '#06b6d4',
                      fillColor: zone.color || '#06b6d4',
                      fillOpacity: 0.18,
                      weight: 2
                    }}
                  />
                  <Marker
                    position={[Number(zone.latitude), Number(zone.longitude)]}
                    icon={createZoneIcon(zone.name, zone.color || '#06b6d4', false)}
                  >
                    <Popup>
                      <div className="p-2 text-xs text-navy-950">
                        <p className="font-bold">{zone.name}</p>
                        <p className="text-slate-500">Radius: {zone.radius}m</p>
                        <p className="font-mono text-[10px]">
                          {Number(zone.latitude).toFixed(6)}, {Number(zone.longitude).toFixed(6)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}

              {/* Draft Tapped Location + Live Radius Preview */}
              {pickedCoords && (
                <>
                  <Circle
                    center={[pickedCoords.lat, pickedCoords.lng]}
                    radius={Number(draftRadius) || 60}
                    pathOptions={{
                      color: '#f59e0b',
                      fillColor: '#f59e0b',
                      fillOpacity: 0.25,
                      weight: 2.5,
                      dashArray: '5, 5'
                    }}
                  />
                  <Marker
                    position={[pickedCoords.lat, pickedCoords.lng]}
                    icon={createZoneIcon(draftName || 'New Zone', '#f59e0b', true)}
                  />
                </>
              )}
            </MapContainer>
          </div>
        </div>

        {/* Right: Save Form & Zones List */}
        <div className="lg:col-span-4 space-y-5">
          <form
            onSubmit={handleSaveZone}
            className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-card space-y-4 text-xs"
          >
            <h3 className="text-sm font-extrabold text-navy-950 dark:text-white flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-cyan-600" /> Save Tapped Zone
            </h3>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 font-mono text-[11px]">
              {pickedCoords ? (
                <span className="text-emerald-700 dark:text-emerald-400">
                  Selected: {pickedCoords.lat.toFixed(6)}, {pickedCoords.lng.toFixed(6)}
                </span>
              ) : (
                <span className="text-slate-500">
                  No point selected yet — tap map or click "Use my GPS position"
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold uppercase text-[10px] text-navy-900 dark:text-slate-300 mb-1">
                Place Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Boys Hostel, Canteen, Library, CSE Hall"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs text-navy-950 dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold uppercase text-[10px] text-navy-900 dark:text-slate-300">
                  Zone Radius (meters)
                </label>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{draftRadius} m</span>
              </div>
              <input
                type="range"
                min={15}
                max={300}
                step={5}
                value={draftRadius}
                onChange={(e) => setDraftRadius(Number(e.target.value))}
                className="w-full accent-cyan-600"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-[10px] text-navy-900 dark:text-slate-300 mb-1.5">
                Zone Color
              </label>
              <div className="flex flex-wrap gap-2">
                {ZONE_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setDraftColor(c.hex)}
                    title={c.label}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      draftColor === c.hex ? 'scale-125 border-navy-950 dark:border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" variant="cyan" size="md" className="w-full" disabled={saving}>
              {saving ? 'Saving Zone...' : 'Save Campus Zone'}
            </Button>
          </form>

          {/* Saved Zones List */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-card space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy-950 dark:text-white flex items-center justify-between">
              <span>Saved College Zones ({collegeZones.length})</span>
            </h3>

            {collegeZones.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                No zones created yet. Tap buildings on the satellite map to create your first zone.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {collegeZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setFlyTarget({
                          lat: Number(zone.latitude),
                          lng: Number(zone.longitude),
                          zoom: 19
                        })
                      }
                      className="text-left min-w-0 flex-1 hover:text-cyan-600"
                    >
                      <p className="font-bold text-navy-950 dark:text-white flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: zone.color || '#06b6d4' }}
                        />
                        <span className="truncate">{zone.name}</span>
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Radius: {zone.radius}m • {Number(zone.latitude).toFixed(5)}, {Number(zone.longitude).toFixed(5)}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteZone(zone.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 shrink-0"
                      title="Delete zone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyZonesManager;
