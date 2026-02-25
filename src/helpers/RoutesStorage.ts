import type { Position } from "./RoutesCalculations";

export const STORAGE_KEY = "bc_stats_routes";

export interface RouteData {
  id: string;
  startTime: string;
  finishTime: string | null;
  positions: Position[];
  totalDistance: number;
  isCompleted: boolean;
}

// Load routes from localStorage
export function loadRoutes(): RouteData[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as RouteData[];
    } catch {
      console.error("Failed to parse stored routes");
      return [];
    }
  }
  return [];
}

// Save routes to localStorage
export function saveRoutes(routes: RouteData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
}
