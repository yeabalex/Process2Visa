// serviceCache.ts
import { Service } from "@/components/BrowseServicesEmptyState";

const STORAGE_KEY = "servicesCache";

// In-memory cache
let cache: { [key: string]: Service } = {};

// Load from sessionStorage (browser only)
if (typeof window !== "undefined") {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure parsed object is keyed by _id
      if (parsed && typeof parsed === "object") {
        cache = parsed;
      }
    } catch (e) {
      console.error("Failed to parse cached services from sessionStorage", e);
      cache = {};
    }
  }
}

// Persist in-memory cache to sessionStorage
function persistCache() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  }
}

/**
 * Get a service from cache by id
 */
export function getServiceFromCache(id: string): Service | undefined {
  return cache[id];
}

/**
 * Set/add a service to cache
 */
export function setServiceToCache(service: Service): void {
    console.log(service);
  if (!service?._id) return; // Ensure _id exists
  cache[service._id] = service;
  persistCache();
}
