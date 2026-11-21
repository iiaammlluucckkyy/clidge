import math

def calculate_haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two GPS coordinates using Haversine formula.
    Returns distance in meters.
    """
    R = 6371000.0  # Earth's radius in meters

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return round(R * c, 2)

def is_within_geofence(student_lat: float, student_lng: float, venue_lat: float, venue_lng: float, radius_meters: float):
    """
    Determines whether a student's GPS coordinate is within the designated geofence radius.
    """
    distance = calculate_haversine_distance_meters(student_lat, student_lng, venue_lat, venue_lng)
    inside = distance <= radius_meters
    return inside, distance
