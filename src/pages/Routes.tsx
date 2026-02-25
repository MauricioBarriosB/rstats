import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Square, MapPin } from "lucide-react";
import { Button, Card, CardBody } from "@heroui/react";
import {
  type Position,
  calculateDistance,
  calculateTotalDistance,
  formatDistance,
  formatDuration,
  getGeolocationErrorMessage,
  isAccurateEnough,
  isSignificantMovement,
} from "../helpers/RoutesCalculations";
import {
  type RouteData,
  loadRoutes,
  saveRoutes,
} from "../helpers/RoutesStorage";
import SavedRoutes from "../components/SavedRoutes";

const TRACKING_INTERVAL = 5000; // 5 seconds

export default function Routes() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<RouteData | null>(null);
  const [savedRoutes, setSavedRoutes] = useState<RouteData[]>(() => loadRoutes());
  const [error, setError] = useState<string | null>(null);
  const [lastPosition, setLastPosition] = useState<Position | null>(null);
  const intervalRef = useRef<number | null>(null);
  const positionsRef = useRef<Position[]>([]);
  const isInitialMount = useRef(true);

  // Save routes to localStorage whenever they change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveRoutes(savedRoutes);
  }, [savedRoutes]);

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
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000, // 30 second timeout
          maximumAge: 5000, // Allow cached positions up to 5 seconds old
        }
      );
    });
  }, []);

  // Start tracking route
  const handleStartRoute = async () => {
    setError(null);
    try {
      // Get initial position
      const initialPosition = await getCurrentPosition();
      const newRoute: RouteData = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        finishTime: null,
        positions: [initialPosition],
        totalDistance: 0,
        isCompleted: false,
      };

      positionsRef.current = [initialPosition];
      setCurrentRoute(newRoute);
      setLastPosition(initialPosition);
      setIsTracking(true);

      // Start interval to track position every 5 seconds
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

          // Only record if movement is significant (accounts for GPS accuracy)
          if (isSignificantMovement(lastPos, position, distance)) {
            positionsRef.current.push(position);
            setLastPosition(position);

            setCurrentRoute((prev) =>
              prev
                ? {
                    ...prev,
                    positions: [...positionsRef.current],
                    totalDistance: calculateTotalDistance(positionsRef.current),
                  }
                : null
            );
          }
        } catch (err) {
          console.error("Error getting position:", err);
        }
      }, TRACKING_INTERVAL);
    } catch (err) {
      const errorMessage =
        err instanceof GeolocationPositionError
          ? getGeolocationErrorMessage(err)
          : "Failed to get location";
      setError(errorMessage);
    }
  };

  // Finish tracking route
  const handleFinishRoute = () => {
    // Stop the interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (currentRoute) {
      const finishedRoute: RouteData = {
        ...currentRoute,
        positions: positionsRef.current,
        finishTime: new Date().toISOString(),
        totalDistance: calculateTotalDistance(positionsRef.current),
        isCompleted: true,
      };

      // Save to localStorage
      setSavedRoutes((prev) => [finishedRoute, ...prev]);
      setCurrentRoute(null);
    }

    positionsRef.current = [];
    setIsTracking(false);
    setLastPosition(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <MapPin size={40} className="text-primary" />
          <h1
            className="text-5xl font-bold text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Routes
          </h1>
        </div>
        <p className="text-lg text-default-600 font-normal">
          Track your journey using GPS. Start tracking to record your route and
          measure the distance covered.
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mb-8">
        <Button
          color="success"
          variant={isTracking ? "flat" : "solid"}
          size="lg"
          startContent={<Play size={20} />}
          onPress={handleStartRoute}
          isDisabled={isTracking}
          className="font-semibold"
        >
          Start Route
        </Button>
        <Button
          color="danger"
          variant={isTracking ? "solid" : "flat"}
          size="lg"
          startContent={<Square size={20} />}
          onPress={handleFinishRoute}
          isDisabled={!isTracking}
          className="font-semibold"
        >
          Finish Route
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 bg-danger-50 border border-danger-200">
          <CardBody>
            <p className="text-danger">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Current Tracking Status */}
      {isTracking && currentRoute && (
        <Card className="mb-8 bg-success-50/10 border border-success-200">
          <CardBody className="gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span className="font-semibold text-success">
                Tracking in progress...
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-default-500">Duration</span>
                <span className="text-lg font-semibold">
                  {formatDuration(currentRoute.startTime, null)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-default-500">Distance</span>
                <span className="text-lg font-semibold">
                  {formatDistance(currentRoute.totalDistance)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-default-500">GPS Points</span>
                <span className="text-lg font-semibold">
                  {currentRoute.positions.length}
                </span>
              </div>
              {lastPosition && (
                <div className="flex flex-col">
                  <span className="text-sm text-default-500">Accuracy</span>
                  <span className="text-lg font-semibold">
                    ±{Math.round(lastPosition.accuracy)}m
                  </span>
                </div>
              )}
            </div>

            {lastPosition && (
              <div className="flex items-center gap-2 text-sm text-default-500">
                <MapPin size={14} />
                <span>
                  {lastPosition.latitude.toFixed(6)},{" "}
                  {lastPosition.longitude.toFixed(6)}
                </span>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <SavedRoutes routes={savedRoutes} />
    </div>
  );
}
