import { useState, useRef, useCallback, useEffect } from "react";

interface UseWakeLockReturn {
  isActive: boolean;
  request: () => Promise<void>;
  release: () => Promise<void>;
  isSupported: boolean;
}

/**
 * Custom hook to manage Screen Wake Lock API
 * Keeps the screen awake while active
 */
export function useWakeLock(autoReacquire = true): UseWakeLockReturn {
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const shouldBeActiveRef = useRef(false); // Track if wake lock should be active
  const isSupported = "wakeLock" in navigator;

  const request = useCallback(async () => {
    if (!isSupported) {
      console.log("Wake Lock API not supported");
      return;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      shouldBeActiveRef.current = true;
      setIsActive(true);
      console.log("Wake Lock acquired");

      wakeLockRef.current.addEventListener("release", () => {
        setIsActive(false);
        console.log("Wake Lock released");
      });
    } catch (err) {
      console.error("Failed to acquire Wake Lock:", err);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    shouldBeActiveRef.current = false;
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsActive(false);
    }
  }, []);

  // Re-acquire wake lock when page becomes visible (if autoReacquire is enabled)
  useEffect(() => {
    if (!autoReacquire) return;

    const handleVisibilityChange = async () => {
      // Re-acquire if wake lock should be active but was released due to visibility change
      if (shouldBeActiveRef.current && document.visibilityState === "visible" && !wakeLockRef.current) {
        await request();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [autoReacquire, request]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldBeActiveRef.current = false;
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

  return { isActive, request, release, isSupported };
}
