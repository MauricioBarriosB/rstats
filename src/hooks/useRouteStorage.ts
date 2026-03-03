import { useState, useEffect, useRef, useCallback } from "react";
import {
  type RouteData,
  loadRoutesAsync,
  saveRoutesAsync,
  checkAppAuthorization,
} from "../helpers/RoutesStorage";

interface UseRouteStorageReturn {
  routes: RouteData[];
  addRoute: (route: RouteData) => void;
  removeRoute: (id: string) => void;
  clearRoutes: () => void;
  isValidated: boolean;
  validationError: boolean;
  isAuthorized: boolean;
}

/**
 * Custom hook for managing routes in localStorage
 * Automatically persists changes with hash validation
 * Requires valid app keys to store data
 */
export function useRouteStorage(): UseRouteStorageReturn {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const isInitialMount = useRef(true);

  // Validate app keys and load data on mount
  useEffect(() => {
    const initializeStorage = async () => {
      // Check if app is authorized with correct keys
      const authorized = await checkAppAuthorization();
      setIsAuthorized(authorized);

      if (!authorized) {
        console.error(
          "App not authorized. Storage functionality disabled."
        );
        setValidationError(true);
        setRoutes([]);
        setIsValidated(true);
        return;
      }

      // Load and validate routes
      try {
        const validatedRoutes = await loadRoutesAsync();
        setRoutes(validatedRoutes);
        setIsValidated(true);
      } catch {
        setValidationError(true);
        setRoutes([]);
        setIsValidated(true);
      }
    };

    initializeStorage();
  }, []);

  // Save routes with hash whenever they change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only save if authorized
    if (isAuthorized) {
      saveRoutesAsync(routes);
    }
  }, [routes, isAuthorized]);

  const addRoute = useCallback(
    (route: RouteData) => {
      if (!isAuthorized) {
        console.error("Cannot add route: App not authorized");
        return;
      }
      setRoutes((prev) => [route, ...prev]);
    },
    [isAuthorized]
  );

  const removeRoute = useCallback(
    (id: string) => {
      if (!isAuthorized) {
        console.error("Cannot remove route: App not authorized");
        return;
      }
      setRoutes((prev) => prev.filter((route) => route.id !== id));
    },
    [isAuthorized]
  );

  const clearRoutes = useCallback(() => {
    if (!isAuthorized) {
      console.error("Cannot clear routes: App not authorized");
      return;
    }
    setRoutes([]);
  }, [isAuthorized]);

  return {
    routes,
    addRoute,
    removeRoute,
    clearRoutes,
    isValidated,
    validationError,
    isAuthorized,
  };
}
