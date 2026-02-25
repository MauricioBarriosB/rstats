import { MapPinPlusInside, MapPin, Clock, Navigation } from "lucide-react";
import { Card, CardBody, Chip } from "@heroui/react";
import { formatDistance, formatDuration } from "../helpers/RoutesCalculations";
import type { RouteData } from "../helpers/RoutesStorage";

interface SavedRoutesProps {
  readonly routes: RouteData[];
}

export default function SavedRoutes({ routes }: Readonly<SavedRoutesProps>) {
  return (
    <>
      {/* Saved Routes */}
      <div className="mb-4">
        <h2
          className="text-2xl font-bold text-foreground mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Saved Routes
        </h2>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardBody className="py-8 text-center">
            <Navigation size={48} className="mx-auto mb-4 text-default-300" />
            <p className="text-default-500">
              No routes saved yet. Start tracking to record your first route!
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4">
          {routes.map((route) => (
            <Card key={route.id}>
              <CardBody className="gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPinPlusInside size={16} className="text-primary" />
                    <span className="font-medium">ROUTE ADDED</span>
                  </div>
                  <Chip color="success" variant="flat" size="sm">
                    Completed
                  </Chip>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-default-500">Distance</span>
                    <span className="text-lg font-semibold">
                      {formatDistance(route.totalDistance)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-default-500">Duration</span>
                    <span className="text-lg font-semibold">
                      {formatDuration(route.startTime, route.finishTime)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-default-500">GPS Points</span>
                    <span className="text-lg font-semibold">
                      {route.positions.length}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-default-100">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-success" />
                    <span className="text-default-500">Start:</span>
                    <span className="font-medium">
                      {new Date(route.startTime).toLocaleDateString()}{" "}
                      {new Date(route.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-danger" />
                    <span className="text-default-500">End:</span>
                    <span className="font-medium">
                      {route.finishTime
                        ? `${new Date(route.finishTime).toLocaleDateString()} ${new Date(route.finishTime).toLocaleTimeString()}`
                        : "—"}
                    </span>
                  </div>
                </div>

                {route.positions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-default-100">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-success" />
                      <span className="text-default-500">Start:</span>
                      <span className="font-medium">
                        {route.positions[0].latitude.toFixed(6)}, {route.positions[0].longitude.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-danger" />
                      <span className="text-default-500">End:</span>
                      <span className="font-medium">
                        {route.positions.at(-1)!.latitude.toFixed(6)}, {route.positions.at(-1)!.longitude.toFixed(6)}
                      </span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
