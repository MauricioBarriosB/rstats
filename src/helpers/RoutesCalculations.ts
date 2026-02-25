/*
The accuracy value of 71 means ±71 meters - it's the radius of uncertainty for your GPS position.
The Geolocation API reports accuracy in meters
A value of 71 means your actual position is somewhere within a 71-meter radius of the reported coordinates
Lower numbers = more precise location
Typical accuracy ranges:
3-10m: High accuracy (GPS with clear sky view)
10-30m: Good accuracy (GPS with some obstructions)
30-100m: Moderate accuracy (indoor, urban canyons, WiFi/cell tower triangulation)
100m+: Low accuracy (no GPS, relying on cell towers)
Your accuracy of 71m suggests the device is likely using WiFi or cell tower positioning rather than pure GPS, possibly because you're indoors or the GPS signal is weak.
*/

export interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

// Haversine formula to calculate distance between two GPS coordinates (in meters)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Calculate total distance from array of positions
export function calculateTotalDistance(positions: Position[]): number {
  let total = 0;
  for (let i = 1; i < positions.length; i++) {
    total += calculateDistance(
      positions[i - 1].latitude,
      positions[i - 1].longitude,
      positions[i].latitude,
      positions[i].longitude
    );
  }
  return total;
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

// Format duration
export function formatDuration(startTime: string, finishTime: string | null): string {
  const start = new Date(startTime).getTime();
  const end = finishTime ? new Date(finishTime).getTime() : Date.now();
  const diff = end - start;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

// GPS accuracy thresholds
export const GPS_CONFIG = {
  MAX_ACCURACY: 50, // Reject readings with accuracy worse than 50 meters (allows indoor/moderate GPS)
  MIN_DISTANCE: 10, // Minimum distance to consider as real movement (increased to compensate for lower accuracy)
};

// Check if a GPS position is accurate enough to use
export function isAccurateEnough(position: Position): boolean {
  return position.accuracy <= GPS_CONFIG.MAX_ACCURACY;
}

// Check if movement between two positions is significant (distance > combined accuracy uncertainty)
export function isSignificantMovement(
  pos1: Position,
  pos2: Position,
  distance: number
): boolean {
  // Movement should be greater than the minimum distance threshold
  // AND greater than the average accuracy of both readings
  const avgAccuracy = (pos1.accuracy + pos2.accuracy) / 2;
  return distance > GPS_CONFIG.MIN_DISTANCE && distance > avgAccuracy * 0.5;
}

// Helper function for geolocation error messages
export function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission denied. Please enable location access.";
    case error.POSITION_UNAVAILABLE:
      return "Location information is unavailable.";
    case error.TIMEOUT:
      return "Location request timed out.";
    default:
      return "An unknown error occurred.";
  }
}
