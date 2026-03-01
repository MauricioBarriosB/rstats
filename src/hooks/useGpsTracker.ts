import { useState, useRef, useCallback, useEffect } from "react";
import { getDistance } from "geolib";

export interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  timestamp: number;
  altitude: number | null; // meters above sea level
  speed: number | null; // m/s (from GPS, more accurate than manual calculation)
  heading: number | null; // direction in degrees (0-360, 0=north)
}

export interface TrackingState {
  /** Current tracking status */
  status: "idle" | "stabilizing" | "tracking" | "finished";
  /** Start point (stabilized) */
  startPoint: GeoPoint | null;
  /** End point (stabilized) */
  endPoint: GeoPoint | null;
  /** All intermediate points recorded during the journey */
  trackPoints: GeoPoint[];
  /** Total distance traveled in meters (sum of segments) */
  totalDistanceMeters: number;
  /** Straight line distance start→end in meters */
  straightLineDistanceMeters: number;
  /** Current GPS accuracy in meters (lower = better) */
  currentAccuracy: number | null;
  /** Human-readable status message */
  statusMessage: string;
  /** Error if any */
  error: string | null;
}

export interface UseGpsTrackerOptions {
  /**
   * Maximum acceptable accuracy in meters.
   * Readings with accuracy greater than this value will be discarded.
   * @default 20
   */
  maxAccuracyThreshold?: number;
  /**
   * Number of "good" readings needed to consider
   * the GPS stabilized and record a reliable point.
   * @default 5
   */
  stabilizationReadings?: number;
  /**
   * Minimum interval in ms between recorded points during tracking.
   * Prevents recording too many points when the user is stationary.
   * @default 2000
   */
  minIntervalMs?: number;
  /**
   * Minimum distance in meters between recorded points.
   * Points closer than this are discarded (reduces GPS noise).
   * @default 3
   */
  minDistanceBetweenPoints?: number;
  /**
   * Enable high accuracy GPS (uses more battery).
   * @default true
   */
  enableHighAccuracy?: boolean;
  /**
   * Minimum speed in m/s to consider the user is moving.
   * Below this value, position-based calculation is used.
   * @default 0.5
   */
  minSpeedThreshold?: number;
  /**
   * Maximum heading change (degrees) between consecutive readings.
   * Larger changes may indicate GPS noise.
   * @default 120
   */
  maxHeadingChange?: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGpsTracker(options: UseGpsTrackerOptions = {}) {
  const {
    maxAccuracyThreshold = 20,
    stabilizationReadings = 5,
    minIntervalMs = 2000,
    minDistanceBetweenPoints = 3,
    enableHighAccuracy = true,
    minSpeedThreshold = 0.5,
    maxHeadingChange = 120,
  } = options;

  const [state, setState] = useState<TrackingState>({
    status: "idle",
    startPoint: null,
    endPoint: null,
    trackPoints: [],
    totalDistanceMeters: 0,
    straightLineDistanceMeters: 0,
    currentAccuracy: null,
    statusMessage: "Ready to start",
    error: null,
  });

  // Refs to handle mutable state within callbacks
  const watchIdRef = useRef<number | null>(null);
  const stabilizationBufferRef = useRef<GeoPoint[]>([]);
  const trackPointsRef = useRef<GeoPoint[]>([]);
  const totalDistanceRef = useRef<number>(0);
  const lastRegisteredPointRef = useRef<GeoPoint | null>(null);
  const lastRegisteredTimeRef = useRef<number>(0);
  const isStabilizingForEndRef = useRef<boolean>(false);
  const resolveEndRef = useRef<(() => void) | null>(null);
  const startPointRef = useRef<GeoPoint | null>(null);

  /**
   * Calculates the average point from a buffer of GPS readings.
   * Weighted by accuracy: more accurate readings have more weight.
   */
  const getStabilizedPoint = useCallback(
    (buffer: GeoPoint[]): GeoPoint => {
      // Weight by inverse of accuracy (lower accuracy = higher weight)
      const weights = buffer.map((p) => 1 / p.accuracy);
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);

      const lat =
        buffer.reduce((sum, p, i) => sum + p.latitude * weights[i], 0) /
        totalWeight;
      const lng =
        buffer.reduce((sum, p, i) => sum + p.longitude * weights[i], 0) /
        totalWeight;
      const avgAccuracy =
        buffer.reduce((sum, p) => sum + p.accuracy, 0) / buffer.length;

      // Calculate average altitude (only from points with valid altitude)
      const pointsWithAltitude = buffer.filter((p) => p.altitude !== null);
      const avgAltitude =
        pointsWithAltitude.length > 0
          ? pointsWithAltitude.reduce((sum, p) => sum + (p.altitude ?? 0), 0) /
            pointsWithAltitude.length
          : null;

      // Use the last valid heading/speed from the buffer
      const lastValidSpeed =
        [...buffer].reverse().find((p) => p.speed !== null)?.speed ?? null;
      const lastValidHeading =
        [...buffer].reverse().find((p) => p.heading !== null)?.heading ?? null;

      return {
        latitude: lat,
        longitude: lng,
        accuracy: avgAccuracy,
        timestamp: Date.now(),
        altitude: avgAltitude,
        speed: lastValidSpeed,
        heading: lastValidHeading,
      };
    },
    []
  );

  /**
   * Calculates the angular difference between two headings (0-180 degrees).
   */
  const getHeadingDelta = useCallback(
    (heading1: number, heading2: number): number => {
      const diff = Math.abs(heading1 - heading2);
      return diff > 180 ? 360 - diff : diff;
    },
    []
  );

  /**
   * Calculates distance considering altitude if available.
   * Uses Pythagorean theorem: distance3D = sqrt(distance2D² + deltaAltitude²)
   */
  const getDistance3D = useCallback(
    (point1: GeoPoint, point2: GeoPoint): number => {
      const distance2D = getDistance(
        { latitude: point1.latitude, longitude: point1.longitude },
        { latitude: point2.latitude, longitude: point2.longitude },
        0.1
      );

      // If both points have altitude, calculate 3D distance
      if (point1.altitude !== null && point2.altitude !== null) {
        const deltaAltitude = point2.altitude - point1.altitude;
        return Math.sqrt(distance2D ** 2 + deltaAltitude ** 2);
      }

      return distance2D;
    },
    []
  );

  /**
   * Stops the browser's watchPosition.
   */
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  /**
   * Starts the stabilization process and then tracking.
   */
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not available in this browser",
        statusMessage: "Error: GPS not available",
      }));
      return;
    }

    // Reset state
    stabilizationBufferRef.current = [];
    trackPointsRef.current = [];
    totalDistanceRef.current = 0;
    lastRegisteredPointRef.current = null;
    lastRegisteredTimeRef.current = 0;
    isStabilizingForEndRef.current = false;
    startPointRef.current = null;

    setState({
      status: "stabilizing",
      startPoint: null,
      endPoint: null,
      trackPoints: [],
      totalDistanceMeters: 0,
      straightLineDistanceMeters: 0,
      currentAccuracy: null,
      statusMessage: "Stabilizing GPS... stay still",
      error: null,
    });

    const handlePosition = (position: GeolocationPosition) => {
      const point: GeoPoint = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        altitude: position.coords.altitude,
        speed: position.coords.speed,
        heading: position.coords.heading,
      };

      setState((prev) => ({ ...prev, currentAccuracy: point.accuracy }));

      // ── Phase: Stabilization for END point ──
      if (isStabilizingForEndRef.current) {
        if (point.accuracy <= maxAccuracyThreshold) {
          stabilizationBufferRef.current.push(point);

          setState((prev) => ({
            ...prev,
            statusMessage: `Stabilizing end point... ${stabilizationBufferRef.current.length}/${stabilizationReadings}`,
          }));

          if (
            stabilizationBufferRef.current.length >= stabilizationReadings
          ) {
            const endPoint = getStabilizedPoint(
              stabilizationBufferRef.current
            );
            const start = startPointRef.current;

            let straightLine = 0;
            if (start) {
              // Use 3D distance for straight line if altitude is available
              straightLine = getDistance3D(start, endPoint);
            }

            // Record last segment if there's a previous point
            if (lastRegisteredPointRef.current) {
              const lastSegment = getDistance3D(
                lastRegisteredPointRef.current,
                endPoint
              );
              totalDistanceRef.current += lastSegment;
            }

            trackPointsRef.current.push(endPoint);

            stopWatching();

            setState((prev) => ({
              ...prev,
              status: "finished",
              endPoint,
              trackPoints: [...trackPointsRef.current],
              totalDistanceMeters: Math.round(totalDistanceRef.current * 10) / 10,
              straightLineDistanceMeters: Math.round(straightLine * 10) / 10,
              statusMessage: "Journey completed",
            }));

            if (resolveEndRef.current) {
              resolveEndRef.current();
              resolveEndRef.current = null;
            }
          }
        }
        return;
      }

      // ── Phase: Stabilization for START point ──
      if (!startPointRef.current) {
        if (point.accuracy <= maxAccuracyThreshold) {
          stabilizationBufferRef.current.push(point);

          setState((prev) => ({
            ...prev,
            statusMessage: `Stabilizing GPS... ${stabilizationBufferRef.current.length}/${stabilizationReadings}`,
          }));

          if (
            stabilizationBufferRef.current.length >= stabilizationReadings
          ) {
            const startPoint = getStabilizedPoint(
              stabilizationBufferRef.current
            );
            startPointRef.current = startPoint;
            lastRegisteredPointRef.current = startPoint;
            lastRegisteredTimeRef.current = Date.now();
            trackPointsRef.current = [startPoint];

            setState((prev) => ({
              ...prev,
              status: "tracking",
              startPoint,
              trackPoints: [startPoint],
              statusMessage: "Tracking active — you can move now",
            }));
          }
        } else {
          setState((prev) => ({
            ...prev,
            statusMessage: `Low accuracy (${Math.round(point.accuracy)}m), waiting for better signal...`,
          }));
        }
        return;
      }

      // ── Phase: Tracking (recording intermediate points) ──
      const now = Date.now();
      const timeSinceLast = now - lastRegisteredTimeRef.current;
      const timeDeltaSeconds = timeSinceLast / 1000;

      // Filter by accuracy
      if (point.accuracy > maxAccuracyThreshold) return;

      // Filter by minimum interval
      if (timeSinceLast < minIntervalMs) return;

      // Filter by minimum distance and calculate segment distance
      if (lastRegisteredPointRef.current) {
        // Calculate 3D distance (considers altitude if available)
        const distFromLast = getDistance3D(lastRegisteredPointRef.current, point);

        // Filter erratic heading changes (possible GPS noise)
        const lastHeading = lastRegisteredPointRef.current.heading;
        if (
          lastHeading !== null &&
          point.heading !== null &&
          getHeadingDelta(lastHeading, point.heading) > maxHeadingChange
        ) {
          // Very sudden direction change, possible noise - ignore this point
          return;
        }

        if (distFromLast < minDistanceBetweenPoints) return;

        // ── Hybrid distance calculation ──
        // Use GPS speed when available and reliable
        const gpsSpeed = point.speed;
        let segmentDistance: number;

        if (
          gpsSpeed !== null &&
          gpsSpeed >= minSpeedThreshold &&
          timeDeltaSeconds > 0 &&
          timeDeltaSeconds < 30 // Avoid long gaps
        ) {
          // Method 1: GPS speed integration (more accurate when moving)
          // GPS speed uses Doppler effect, less affected by positional noise
          const speedBasedDistance = gpsSpeed * timeDeltaSeconds;

          // Validate that speed-based distance is reasonable vs position
          // If they differ a lot, use weighted average
          const ratio = speedBasedDistance / distFromLast;
          if (ratio > 0.5 && ratio < 2.0) {
            // Speed and position match reasonably - use speed
            segmentDistance = speedBasedDistance;
          } else {
            // Large discrepancy - use weighted average (favors speed)
            segmentDistance = speedBasedDistance * 0.7 + distFromLast * 0.3;
          }
        } else {
          // Method 2: Fallback to position-based calculation (when stationary or no speed)
          segmentDistance = distFromLast;
        }

        totalDistanceRef.current += segmentDistance;
      }

      lastRegisteredPointRef.current = point;
      lastRegisteredTimeRef.current = now;
      trackPointsRef.current.push(point);

      setState((prev) => ({
        ...prev,
        trackPoints: [...trackPointsRef.current],
        totalDistanceMeters: Math.round(totalDistanceRef.current * 10) / 10,
        statusMessage: `Tracking... ${trackPointsRef.current.length} points | ${Math.round(totalDistanceRef.current)}m traveled`,
      }));
    };

    const handleError = (error: GeolocationPositionError) => {
      let message = "Unknown GPS error";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = "Location permission denied";
          break;
        case error.POSITION_UNAVAILABLE:
          message = "Location unavailable";
          break;
        case error.TIMEOUT:
          message = "Location request timeout";
          break;
      }

      setState((prev) => ({
        ...prev,
        error: message,
        statusMessage: `Error: ${message}`,
      }));
    };

    // Start watchPosition
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy,
        maximumAge: 0, // Don't use cache
        timeout: 10000,
      }
    );
  }, [
    maxAccuracyThreshold,
    stabilizationReadings,
    minIntervalMs,
    minDistanceBetweenPoints,
    enableHighAccuracy,
    minSpeedThreshold,
    maxHeadingChange,
    getStabilizedPoint,
    getDistance3D,
    getHeadingDelta,
    stopWatching,
  ]);

  /**
   * Finishes the journey. Stabilizes the end point before stopping.
   * Returns a promise that resolves when the end point is stabilized.
   */
  const stopTracking = useCallback((): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (state.status !== "tracking") {
        resolve();
        return;
      }

      // Start end point stabilization
      stabilizationBufferRef.current = [];
      isStabilizingForEndRef.current = true;
      resolveEndRef.current = resolve;

      setState((prev) => ({
        ...prev,
        status: "stabilizing",
        statusMessage: "Stabilizing end point... stay still",
      }));
    });
  }, [state.status]);

  /**
   * Cancels tracking without recording end point.
   */
  const cancelTracking = useCallback(() => {
    stopWatching();
    isStabilizingForEndRef.current = false;

    setState({
      status: "idle",
      startPoint: null,
      endPoint: null,
      trackPoints: [],
      totalDistanceMeters: 0,
      straightLineDistanceMeters: 0,
      currentAccuracy: null,
      statusMessage: "Tracking cancelled",
      error: null,
    });
  }, [stopWatching]);

  /**
   * Resets to initial state.
   */
  const reset = useCallback(() => {
    stopWatching();
    isStabilizingForEndRef.current = false;

    setState({
      status: "idle",
      startPoint: null,
      endPoint: null,
      trackPoints: [],
      totalDistanceMeters: 0,
      straightLineDistanceMeters: 0,
      currentAccuracy: null,
      statusMessage: "Ready to start",
      error: null,
    });
  }, [stopWatching]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    ...state,
    startTracking,
    stopTracking,
    cancelTracking,
    reset,
  };
}