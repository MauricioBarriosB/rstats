import { useState, useRef, useCallback, useEffect } from "react";
import {
  type Position,
  calculateDistance,
  calculateTotalDistance,
  getGeolocationErrorMessage,
  isAccurateEnough,
  isSignificantMovement,
} from "../helpers/RoutesCalculations";

interface UseGeolocationOptions {
  interval?: number;
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface UseGeolocationReturn {
  isTracking: boolean;
  positions: Position[];
  lastPosition: Position | null;
  totalDistance: number;
  error: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => Position[];
}

const DEFAULT_OPTIONS: Required<UseGeolocationOptions> = {
  interval: 5000,
  enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 5000,
};

/**
 * Custom hook for GPS tracking with interval-based position updates
 */
export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const [isTracking, setIsTracking] = useState(false);
  const [lastPosition, setLastPosition] = useState<Position | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  const positionsRef = useRef<Position[]>([]);

  // Get current position using Geolocation API
  const getCurrentPosition = useCallback((): Promise<Position> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (err) => reject(err),
        {
          enableHighAccuracy: config.enableHighAccuracy,
          timeout: config.timeout,
          maximumAge: config.maximumAge,
        }
      );
    });
  }, [config.enableHighAccuracy, config.timeout, config.maximumAge]);

  // Start tracking
  const startTracking = useCallback(async () => {
    setError(null);

    try {
      const initialPosition = await getCurrentPosition();

      positionsRef.current = [initialPosition];
      setLastPosition(initialPosition);
      setTotalDistance(0);
      setIsTracking(true);

      // Start interval to track position
      intervalRef.current = globalThis.setInterval(async () => {
        try {
          const position = await getCurrentPosition();

          // Skip positions with poor GPS accuracy
          if (!isAccurateEnough(position)) {
            console.log(`Skipping position: accuracy ${position.accuracy}m too poor`);
            return;
          }

          const lastPos = positionsRef.current.at(-1)!;
          const distance = calculateDistance(
            lastPos.latitude,
            lastPos.longitude,
            position.latitude,
            position.longitude
          );

          // Only record if movement is significant
          if (isSignificantMovement(lastPos, position, distance)) {
            positionsRef.current.push(position);
            setLastPosition(position);
            setTotalDistance(calculateTotalDistance(positionsRef.current));
          }
        } catch (err) {
          console.error("Error getting position:", err);
        }
      }, config.interval);
    } catch (err) {
      const errorMessage =
        err instanceof GeolocationPositionError
          ? getGeolocationErrorMessage(err)
          : "Failed to get location";
      setError(errorMessage);
      throw err;
    }
  }, [getCurrentPosition, config.interval]);

  // Stop tracking and return collected positions
  const stopTracking = useCallback((): Position[] => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const collectedPositions = [...positionsRef.current];

    positionsRef.current = [];
    setIsTracking(false);
    setLastPosition(null);
    setTotalDistance(0);

    return collectedPositions;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    positions: positionsRef.current,
    lastPosition,
    totalDistance,
    error,
    startTracking,
    stopTracking,
  };
}
