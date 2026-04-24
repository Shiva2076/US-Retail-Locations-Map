import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ViewportBounds,
  Filters,
  StateCount,
  ClusterFeature,
  Store,
  ZoomTier,
  getZoomTier,
} from '../types';
import { fetchStateCounts, fetchClusters, fetchStores } from '../utils/api';
import { useDebounce } from './useDebounce';

interface MapDataResult {
  stateCounts: StateCount[];
  clusters: ClusterFeature[];
  stores: Store[];
  loading: boolean;
  tier: ZoomTier;
  error: string | null;
  retry: () => void;
}

export function useMapData(
  bounds: ViewportBounds | null,
  zoom: number,
  filters: Partial<Filters>
): MapDataResult {
  const [stateCounts, setStateCounts] = useState<StateCount[]>([]);
  const [clusters, setClusters] = useState<ClusterFeature[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => setRetryCount((c) => c + 1), []);

  const boundsStr = bounds
    ? `${bounds.swLat.toFixed(2)},${bounds.swLng.toFixed(2)},${bounds.neLat.toFixed(2)},${bounds.neLng.toFixed(2)}`
    : '';

  const debouncedBoundsStr = useDebounce(boundsStr, 250);
  const debouncedZoom = useDebounce(zoom, 250);
  const debouncedBrand = useDebounce(filters.brand ?? '', 250);
  const debouncedStatus = useDebounce(filters.status ?? '', 250);
  const debouncedState = useDebounce(filters.state ?? '', 250);

  const tier = getZoomTier(debouncedZoom);
  const cache = useRef(new Map<string, unknown>());

  // Clear stale markers immediately when tier changes to prevent visual ghosting
  useEffect(() => {
    setStateCounts([]);
    setClusters([]);
    setStores([]);
    setError(null);
  }, [tier]);

  useEffect(() => {
    if (tier !== 'country' && !debouncedBoundsStr) return;

    const cacheKey = `${tier}|${debouncedBoundsStr}|${debouncedZoom}|${debouncedBrand}|${debouncedStatus}|${debouncedState}`;

    if (cache.current.has(cacheKey)) {
      const cached = cache.current.get(cacheKey);
      if (tier === 'country') setStateCounts(cached as StateCount[]);
      else if (tier === 'regional') setClusters(cached as ClusterFeature[]);
      else setStores(cached as Store[]);
      setError(null);
      return;
    }

    const parsedBounds: ViewportBounds | null = debouncedBoundsStr
      ? (() => {
          const parts = debouncedBoundsStr.split(',').map(Number);
          return { swLat: parts[0], swLng: parts[1], neLat: parts[2], neLng: parts[3] };
        })()
      : null;

    const activeFilters: Partial<Filters> = {
      brand: debouncedBrand || undefined,
      status: debouncedStatus || undefined,
      state: debouncedState || undefined,
    };

    let cancelled = false;
    setLoading(true);
    setError(null);

    const doFetch = async () => {
      try {
        if (tier === 'country') {
          const data = await fetchStateCounts(activeFilters);
          if (!cancelled) { setStateCounts(data); cache.current.set(cacheKey, data); }
        } else if (tier === 'regional' && parsedBounds) {
          const data = await fetchClusters(parsedBounds, debouncedZoom, activeFilters);
          if (!cancelled) { setClusters(data); cache.current.set(cacheKey, data); }
        } else if (tier === 'street' && parsedBounds) {
          const data = await fetchStores(parsedBounds, activeFilters);
          if (!cancelled) { setStores(data); cache.current.set(cacheKey, data); }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load map data. Check your connection and try again.');
          console.error('Map data fetch failed:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doFetch();
    return () => { cancelled = true; };
  }, [tier, debouncedBoundsStr, debouncedZoom, debouncedBrand, debouncedStatus, debouncedState, retryCount]);

  return { stateCounts, clusters, stores, loading, tier, error, retry };
}
