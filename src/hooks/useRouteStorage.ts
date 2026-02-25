import { useState, useEffect, useRef, useCallback } from "react";
import { type RouteData, loadRoutes, saveRoutes } from "../helpers/RoutesStorage";

interface UseRouteStorageReturn {
  routes: RouteData[];
  addRoute: (route: RouteData) => void;
  removeRoute: (id: string) => void;
  clearRoutes: () => void;
}

/**
 * Custom hook for managing routes in localStorage
 * Automatically persists changes to localStorage
 */
export function useRouteStorage(): UseRouteStorageReturn {
  const [routes, setRoutes] = useState<RouteData[]>(() => loadRoutes());
  const isInitialMount = useRef(true);

  // Save routes to localStorage whenever they change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveRoutes(routes);
  }, [routes]);

  const addRoute = useCallback((route: RouteData) => {
    setRoutes((prev) => [route, ...prev]);
  }, []);

  const removeRoute = useCallback((id: string) => {
    setRoutes((prev) => prev.filter((route) => route.id !== id));
  }, []);

  const clearRoutes = useCallback(() => {
    setRoutes([]);
  }, []);

  return { routes, addRoute, removeRoute, clearRoutes };
}
