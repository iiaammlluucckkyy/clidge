/**
 * Rate-limited OpenStreetMap Nominatim reverse geocoding service.
 * Enforces a strict minimum 5-second interval between network requests
 * and reuses cached results if the coordinate changed by less than 25 meters.
 */

import { calculateHaversineMeters } from '../data/campusZones.js';

const MIN_INTERVAL_MS = 5000;
const REUSE_DISTANCE_METERS = 25;

let lastRequestAt = 0;
let lastQueryCoords = null;
let lastAddressResult = null;
let inflightPromise = null;

const formatNominatimAddress = (data, lat, lng) => {
  if (!data) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  const addr = data.address || {};
  const parts = [];

  const street =
    addr.building ||
    addr.amenity ||
    addr.road ||
    addr.pedestrian ||
    addr.footway ||
    addr.residential ||
    addr.neighbourhood ||
    addr.suburb;
  if (street) parts.push(street);

  const area = addr.village || addr.town || addr.city || addr.county;
  if (area && !parts.includes(area)) parts.push(area);

  const state = addr.state;
  if (state && !parts.includes(state) && parts.length < 3) parts.push(state);

  const country = addr.country;
  if (country && parts.length < 3) parts.push(country);

  if (parts.length > 0) return parts.join(', ');
  if (data.display_name) {
    return data.display_name.split(',').slice(0, 3).map(s => s.trim()).join(', ');
  }
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

/**
 * Reverse geocode a coordinate to a concise human-readable street address.
 * Never exceeds 1 request per 5 seconds across the entire app.
 */
export const reverseGeocodeAddress = async (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    return 'Unknown location';
  }

  // Reuse cached street address if user barely moved
  if (lastQueryCoords && lastAddressResult) {
    const movedMeters = calculateHaversineMeters(lastQueryCoords.lat, lastQueryCoords.lng, lat, lng);
    if (movedMeters !== null && movedMeters < REUSE_DISTANCE_METERS) {
      return lastAddressResult;
    }
  }

  // Rate limit: 1 request per 5 seconds
  const now = Date.now();
  if (now - lastRequestAt < MIN_INTERVAL_MS) {
    if (lastAddressResult) return lastAddressResult;
    return `GPS ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  if (inflightPromise) {
    return inflightPromise;
  }

  lastRequestAt = now;

  inflightPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;

      const response = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return lastAddressResult || `GPS ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }

      const data = await response.json();
      const formatted = formatNominatimAddress(data, lat, lng);
      lastQueryCoords = { lat, lng };
      lastAddressResult = formatted;
      return formatted;
    } catch {
      return lastAddressResult || `GPS ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } finally {
      inflightPromise = null;
    }
  })();

  return inflightPromise;
};
