import type { StateCount, ClusterFeature, Store, ViewportBounds, Filters } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

function buildParams(obj: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined && val !== '') {
      params.set(key, String(val));
    }
  }
  return params.toString();
}

export async function fetchStateCounts(filters: Partial<Filters>): Promise<StateCount[]> {
  const qs = buildParams({
    brand: filters.brand,
    status: filters.status,
  });
  const res = await fetch(`${API_BASE}/api/stores/state-counts${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<StateCount[]>;
}

export async function fetchClusters(
  bounds: ViewportBounds,
  zoom: number,
  filters: Partial<Filters>
): Promise<ClusterFeature[]> {
  const qs = buildParams({
    swLat: bounds.swLat,
    swLng: bounds.swLng,
    neLat: bounds.neLat,
    neLng: bounds.neLng,
    zoom,
    state: filters.state,
    brand: filters.brand,
    status: filters.status,
  });
  const res = await fetch(`${API_BASE}/api/stores/clusters?${qs}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<ClusterFeature[]>;
}

export async function fetchStores(
  bounds: ViewportBounds,
  filters: Partial<Filters>
): Promise<Store[]> {
  const qs = buildParams({
    swLat: bounds.swLat,
    swLng: bounds.swLng,
    neLat: bounds.neLat,
    neLng: bounds.neLng,
    state: filters.state,
    brand: filters.brand,
    status: filters.status,
  });
  const res = await fetch(`${API_BASE}/api/stores/street?${qs}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<Store[]>;
}

export interface CityResult {
  city: string;
  state: string;
  lat: number;
  lng: number;
}

export async function fetchCitySearch(q: string): Promise<CityResult[]> {
  if (!q || q.trim().length < 2) return [];
  const qs = buildParams({ q: q.trim() });
  const res = await fetch(`${API_BASE}/api/stores/search?${qs}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<CityResult[]>;
}
