import { useState } from "react";
import { Play, Square, MapPin } from "lucide-react";
import { Button, Card, CardBody } from "@heroui/react";
import {
  formatDistance,
  formatDuration,
  calculateTotalDistance,
} from "../helpers/RoutesCalculations";
import { type RouteData } from "../helpers/RoutesStorage";
import SavedRoutes from "../components/SavedRoutes";
import { useWakeLock, useGeolocation, useRouteStorage } from "../hooks";

const TRACKING_INTERVAL = 5000; // 5 seconds

export default function Routes() {
  const [currentRoute, setCurrentRoute] = useState<RouteData | null>(null);

  // Custom hooks
  const wakeLock = useWakeLock();
  const geolocation = useGeolocation({ interval: TRACKING_INTERVAL });
  const { routes: savedRoutes, addRoute } = useRouteStorage();

  // Start tracking route
  const handleStartRoute = async () => {
    try {
      await geolocation.startTracking();

      const newRoute: RouteData = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        finishTime: null,
        positions: [],
        totalDistance: 0,
        isCompleted: false,
      };
      setCurrentRoute(newRoute);
      // Request wake lock to keep screen awake
      await wakeLock.request();
    } catch {
      // Error is handled by useGeolocation hook
    }
  };

  // Finish tracking route
  const handleFinishRoute = async () => {
    const positions = geolocation.stopTracking();

    // Release wake lock
    await wakeLock.release();

    if (currentRoute && positions.length > 0) {
      const finishedRoute: RouteData = {
        ...currentRoute,
        positions,
        finishTime: new Date().toISOString(),
        totalDistance: calculateTotalDistance(positions),
        isCompleted: true,
      };

      addRoute(finishedRoute);
    }

    setCurrentRoute(null);
  };

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
          variant={geolocation.isTracking ? "flat" : "solid"}
          size="lg"
          startContent={<Play size={20} />}
          onPress={handleStartRoute}
          isDisabled={geolocation.isTracking}
          className="font-semibold"
        >
          Start Route
        </Button>
        <Button
          color="danger"
          variant={geolocation.isTracking ? "solid" : "flat"}
          size="lg"
          startContent={<Square size={20} />}
          onPress={handleFinishRoute}
          isDisabled={!geolocation.isTracking}
          className="font-semibold"
        >
          Finish Route
        </Button>
      </div>

      {/* Error Message */}
      {geolocation.error && (
        <Card className="mb-6 bg-danger-50 border border-danger-200">
          <CardBody>
            <p className="text-danger">{geolocation.error}</p>
          </CardBody>
        </Card>
      )}

      {/* Current Tracking Status */}
      {geolocation.isTracking && currentRoute && (
        <Card className="mb-8 bg-success-50/10 border border-success-200">
          <CardBody className="gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                <span className="font-semibold text-success">
                  Tracking in progress...
                </span>
              </div>
              {wakeLock.isActive && (
                <span className="text-xs text-default-500 bg-default-100 px-2 py-1 rounded">
                  Screen stays awake
                </span>
              )}
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
                  {formatDistance(geolocation.totalDistance)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-default-500">GPS Points</span>
                <span className="text-lg font-semibold">
                  {geolocation.positions.length}
                </span>
              </div>
              {geolocation.lastPosition && (
                <div className="flex flex-col">
                  <span className="text-sm text-default-500">Accuracy</span>
                  <span className="text-lg font-semibold">
                    ±{Math.round(geolocation.lastPosition.accuracy)}m
                  </span>
                </div>
              )}
            </div>

            {geolocation.lastPosition && (
              <div className="flex items-center gap-2 text-sm text-default-500">
                <MapPin size={14} />
                <span>
                  {geolocation.lastPosition.latitude.toFixed(6)},{" "}
                  {geolocation.lastPosition.longitude.toFixed(6)}
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
