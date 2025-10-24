/**
 * Calculate the distance between two geographic points using the Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Check if a point is within a certain radius of another point
 */
export function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radiusMeters;
}

/**
 * Validate latitude and longitude values
 */
export function validateCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Get distance validation result for attendance
 */
export interface DistanceValidationResult {
  withinRadius: boolean;
  distanceMeters: number;
}

export function validateAttendanceLocation(
  eventLat: number,
  eventLon: number,
  studentLat: number,
  studentLon: number,
  maxRadiusMeters: number = 10
): DistanceValidationResult {
  const distance = calculateDistance(eventLat, eventLon, studentLat, studentLon);
  const withinRadius = distance <= maxRadiusMeters;

  return {
    withinRadius,
    distanceMeters: distance
  };
}