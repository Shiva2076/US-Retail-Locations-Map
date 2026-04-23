import type { StateCount, ClusterFeature, Store, ViewportBounds, Filters } from '../types';

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
  const res = await fetch(`/api/stores/state-counts${qs ? `?${qs}` : ''}`);
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
  const res = await fetch(`/api/stores/clusters?${qs}`);
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
  const res = await fetch(`/api/stores/street?${qs}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<Store[]>;
}
