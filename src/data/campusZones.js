/**
 * CLIDGE Campus Location & Zone Matching Utilities
 * A brand-new college always starts with ZERO default or fake zones.
 * Faculty define real campus zones (Hostel, Canteen, Library, Classrooms, etc.)
 * directly on the interactive satellite map or using their live GPS position.
 */

export const CAMPUS_ZONES = [];

/**
 * Great-circle Haversine distance in meters
 */
export const calculateHaversineMeters = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === undefined || lon1 === undefined ||
    lat2 === undefined || lon2 === undefined ||
    lat1 === null || lon1 === null || lat2 === null || lon2 === null
  ) {
    return null;
  }
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);
  if ([nLat1, nLon1, nLat2, nLon2].some(Number.isNaN)) return null;

  const R = 6371000;
  const phi1 = (nLat1 * Math.PI) / 180;
  const phi2 = (nLat2 * Math.PI) / 180;
  const deltaPhi = ((nLat2 - nLat1) * Math.PI) / 180;
  const deltaLambda = ((nLon2 - nLon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Finds the nearest college zone ONLY if (lat, lng) is strictly within zone.radius meters.
 * Never returns a zone name if the student is outside every zone's radius.
 */
export const matchCampusZone = (lat, lng, zones = []) => {
  if (!Array.isArray(zones) || zones.length === 0) return null;
  let bestMatch = null;
  let bestDist = Infinity;

  for (const zone of zones) {
    const zLat = Number(zone.latitude ?? zone.center?.lat);
    const zLng = Number(zone.longitude ?? zone.center?.lng);
    const zRadius = Number(zone.radius ?? zone.radiusMeters ?? 60);
    const dist = calculateHaversineMeters(lat, lng, zLat, zLng);
    if (dist !== null && dist <= zRadius && dist < bestDist) {
      bestDist = dist;
      bestMatch = {
        ...zone,
        distanceMeters: Math.round(dist),
        radius: zRadius
      };
    }
  }

  return bestMatch;
};

/**
 * Resolves a coordinate against the college's configured zones.
 * If inside a zone's radius, returns the zone name.
 * Otherwise returns isInside: false so callers display the Nominatim street address.
 */
export const getCampusLandmark = (lat, lng, zones = []) => {
  if (lat === undefined || lng === undefined || lat === null || lng === null) {
    return {
      landmark: 'Waiting for GPS...',
      isInside: false,
      distanceMeters: null,
      zone: null
    };
  }

  const matched = matchCampusZone(lat, lng, zones);
  if (matched) {
    return {
      landmark: matched.name,
      isInside: true,
      distanceMeters: matched.distanceMeters,
      color: matched.color || '#06b6d4',
      zone: matched
    };
  }

  return {
    landmark: null,
    isInside: false,
    distanceMeters: null,
    zone: null
  };
};
