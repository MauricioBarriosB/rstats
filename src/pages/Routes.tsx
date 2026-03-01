import { useState } from "react";
import { Play, Square, MapPin } from "lucide-react";
import { Button, Card, CardBody } from "@heroui/react";
import {
  formatDistance,
  formatDuration,
} from "../helpers/RoutesCalculations";
import { type RouteData } from "../helpers/RoutesStorage";
import SavedRoutes from "../components/SavedRoutes";
import { useWakeLock, useGpsTracker, useRouteStorage } from "../hooks";

export default function Routes() {
  const [routeStartTime, setRouteStartTime] = useState<string | null>(null);

  // Custom hooks
  const wakeLock = useWakeLock();
  const gps = useGpsTracker({
    maxAccuracyThreshold: 30,
    stabilizationReadings: 3,
    minIntervalMs: 2000,
    minDistanceBetweenPoints: 5,
  });
  const { routes: savedRoutes, addRoute, removeRoute } = useRouteStorage();

  const isActive = gps.status === "tracking" || gps.status === "stabilizing";

  // Start tracking route
  const handleStartRoute = () => {
    gps.startTracking();
    setRouteStartTime(new Date().toISOString());
    // Request wake lock to keep screen awake
    wakeLock.request();
  };

  // Finish tracking route
  const handleFinishRoute = async () => {
    await gps.stopTracking();

    // Release wake lock
    await wakeLock.release();

    if (routeStartTime && gps.trackPoints.length > 0) {
      // Convert GeoPoints to Position format for storage
      const positions = gps.trackPoints.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
        accuracy: p.accuracy,
        timestamp: p.timestamp,
      }));

      const finishedRoute: RouteData = {
        id: Date.now().toString(),
        startTime: routeStartTime,
        finishTime: new Date().toISOString(),
        positions,
        totalDistance: gps.totalDistanceMeters,
        isCompleted: true,
      };

      addRoute(finishedRoute);
    }

    setRouteStartTime(null);
    gps.reset();
  };

  const lastPoint = gps.trackPoints.at(-1);

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
          variant={isActive ? "flat" : "solid"}
          size="lg"
          startContent={<Play size={20} />}
          onPress={handleStartRoute}
          isDisabled={isActive}
          className="font-semibold"
        >
          Start Route
        </Button>
        <Button
          color="danger"
          variant={isActive ? "solid" : "flat"}
          size="lg"
          startContent={<Square size={20} />}
          onPress={handleFinishRoute}
          isDisabled={!isActive}
          className="font-semibold"
        >
          Finish Route
        </Button>
      </div>

      {/* Error Message */}
      {gps.error && (
        <Card className="mb-6 bg-danger-50 border border-danger-200">
          <CardBody>
            <p className="text-danger">{gps.error}</p>
          </CardBody>
        </Card>
      )}

      {/* Current Tracking Status */}
      {isActive && routeStartTime && (
        <Card className="mb-8 bg-success-50/10 border border-success-200">
          <CardBody className="gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                <span className="font-semibold text-success">
                  {gps.statusMessage}
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
                  {formatDuration(routeStartTime, null)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-default-500">Distance</span>
                <span className="text-lg font-semibold">
                  {formatDistance(gps.totalDistanceMeters)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-default-500">GPS Points</span>
                <span className="text-lg font-semibold">
                  {gps.trackPoints.length}
                </span>
              </div>
              {gps.currentAccuracy !== null && (
                <div className="flex flex-col">
                  <span className="text-sm text-default-500">Accuracy</span>
                  <span className="text-lg font-semibold">
                    ±{Math.round(gps.currentAccuracy)}m
                  </span>
                </div>
              )}
            </div>

            {lastPoint && (
              <div className="flex items-center gap-2 text-sm text-default-500">
                <MapPin size={14} />
                <span>
                  {lastPoint.latitude.toFixed(6)},{" "}
                  {lastPoint.longitude.toFixed(6)}
                </span>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <SavedRoutes routes={savedRoutes} onDelete={removeRoute} />
    </div>
  );
}
