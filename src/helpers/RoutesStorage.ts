import type { Position } from "./RoutesCalculations";
import {
  generateHash,
  validateHash,
  areSecurityKeysConfigured,
  validateAppKeys,
} from "./hashValidation";

export const STORAGE_KEY = "bc_stats_routes";
export const HASH_KEY = "bc_stats_routes_hash";

export interface RouteData {
  id: string;
  label?: string;
  startTime: string;
  finishTime: string | null;
  positions: Position[];
  totalDistance: number;
  isCompleted: boolean;
}

// Cache for app key validation result
let appKeysValidated: boolean | null = null;

/**
 * Validate app keys (cached after first check)
 */
export async function checkAppAuthorization(): Promise<boolean> {
  if (appKeysValidated !== null) {
    return appKeysValidated;
  }

  if (!areSecurityKeysConfigured()) {
    console.error("Security keys not configured");
    appKeysValidated = false;
    return false;
  }

  appKeysValidated = await validateAppKeys();
  return appKeysValidated;
}

// Load routes from localStorage with hash validation
export async function loadRoutesAsync(): Promise<RouteData[]> {
  // First check if app is authorized
  const isAuthorized = await checkAppAuthorization();
  if (!isAuthorized) {
    console.error("Unauthorized app. Data loading blocked.");
    return [];
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  const storedHash = localStorage.getItem(HASH_KEY);

  if (stored && storedHash) {
    try {
      const isValid = await validateHash(stored, storedHash);
      if (!isValid) {
        console.error("Data integrity check failed. Data may be corrupted.");
        return [];
      }
      return JSON.parse(stored) as RouteData[];
    } catch {
      console.error("Failed to parse stored routes");
      return [];
    }
  }
  return [];
}

// Synchronous load for initial state (without validation)
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

// Save routes to localStorage with hash signature
export async function saveRoutesAsync(routes: RouteData[]): Promise<boolean> {
  // First check if app is authorized
  const isAuthorized = await checkAppAuthorization();
  if (!isAuthorized) {
    console.error("Unauthorized app. Data saving blocked.");
    return false;
  }

  const data = JSON.stringify(routes);
  const hash = await generateHash(data);
  localStorage.setItem(STORAGE_KEY, data);
  localStorage.setItem(HASH_KEY, hash);
  return true;
}

// Legacy sync save (for backwards compatibility)
export function saveRoutes(routes: RouteData[]): void {
  saveRoutesAsync(routes).catch((err) =>
    console.error("Failed to save routes:", err)
  );
}

// Validate stored data integrity
export async function validateStoredData(): Promise<boolean> {
  const isAuthorized = await checkAppAuthorization();
  if (!isAuthorized) {
    return false;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  const storedHash = localStorage.getItem(HASH_KEY);

  if (!stored || !storedHash) {
    return true; // No data to validate
  }

  return validateHash(stored, storedHash);
}
