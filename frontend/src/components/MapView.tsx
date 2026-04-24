import { useState, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
  useMap,
} from '@vis.gl/react-google-maps';
import { Filters, ViewportBounds } from '../types';
import { useMapData } from '../hooks/useMapData';
import StateMarkers from './StateMarkers';
import ClusterMarkers from './ClusterMarkers';
import StoreMarkers from './StoreMarkers';
import FilterSidebar from './FilterSidebar';
import LoadingOverlay from './LoadingOverlay';
import StatsBar from './StatsBar';
import ErrorBanner from './ErrorBanner';

// Read initial filter values from URL query params so links are shareable
function readFiltersFromUrl(): Partial<Filters> {
  const p = new URLSearchParams(window.location.search);
  const f: Partial<Filters> = {};
  const state = p.get('state'); if (state) f.state = state as Filters['state'];
  const brand = p.get('brand'); if (brand) f.brand = brand as Filters['brand'];
  const status = p.get('status'); if (status) f.status = status as Filters['status'];
  return f;
}

// Sync filters into URL without triggering a navigation
function writeFiltersToUrl(filters: Partial<Filters>) {
  const p = new URLSearchParams();
  if (filters.state) p.set('state', filters.state);
  if (filters.brand) p.set('brand', filters.brand);
  if (filters.status) p.set('status', filters.status);
  const qs = p.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

function ResetViewButton() {
  const map = useMap();
  return (
    <button
      onClick={() => {
        if (!map) return;
        map.panTo({ lat: 39.5, lng: -98.35 });
        map.setZoom(4);
      }}
      title="Reset to full US view"
      style={{
        position: 'absolute',
        bottom: '80px',
        right: '10px',
        background: 'rgba(26,26,46,0.92)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 14px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        zIndex: 5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        letterSpacing: '0.3px',
      }}
    >
      ↺ Reset View
    </button>
  );
}

const TIER_LABEL: Record<string, string> = {
  country: '🗺 Country',
  regional: '🔍 Regional',
  street: '📍 Street',
};

function MapContent({
  filters,
  setFilters,
}: {
  filters: Partial<Filters>;
  setFilters: (f: Partial<Filters>) => void;
}) {
  const [zoom, setZoom] = useState(4);
  const [bounds, setBounds] = useState<ViewportBounds | null>(null);

  const { stateCounts, clusters, stores, loading, tier, error, retry } = useMapData(
    bounds,
    zoom,
    filters
  );

  const isEmpty =
    !loading &&
    !error &&
    ((tier === 'country' && stateCounts.length === 0) ||
      (tier === 'regional' && clusters.length === 0) ||
      (tier === 'street' && stores.length === 0));

  const handleCameraChanged = useCallback((event: MapCameraChangedEvent) => {
    const { detail } = event;
    const b = detail.bounds;
    setZoom(detail.zoom);
    setBounds({
      swLat: b.south,
      swLng: b.west,
      neLat: b.north,
      neLng: b.east,
    });
  }, []);

  return (
    <>
      <Map
        defaultCenter={{ lat: 39.5, lng: -98.35 }}
        defaultZoom={4}
        mapId="retail-map"
        gestureHandling="greedy"
        disableDefaultUI={false}
        onCameraChanged={handleCameraChanged}
        style={{ width: '100%', height: '100%' }}
      >
        {tier === 'country' && <StateMarkers stateCounts={stateCounts} />}
        {tier === 'regional' && <ClusterMarkers clusters={clusters} />}
        {tier === 'street' && <StoreMarkers stores={stores} />}
        <ResetViewButton />
      </Map>

      <FilterSidebar filters={filters} onChange={setFilters} />

      {loading && <LoadingOverlay />}

      {error && <ErrorBanner message={error} onRetry={retry} />}

      {isEmpty && !error && (
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.95)',
            padding: '8px 18px',
            borderRadius: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            fontSize: '13px',
            color: '#555',
            fontWeight: '500',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          No stores match the current filters
        </div>
      )}

      <StatsBar
        tier={tier}
        stateCounts={stateCounts}
        clusters={clusters}
        stores={stores}
        loading={loading}
      />

      {/* Tier indicator badge */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(26,26,46,0.90)',
          color: 'white',
          padding: '6px 14px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          fontSize: '11px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          zIndex: 5,
        }}
      >
        {TIER_LABEL[tier] ?? tier}
      </div>
    </>
  );
}

export default function MapView() {
  const [filters, setFilters] = useState<Partial<Filters>>(readFiltersFromUrl);

  // Keep URL in sync whenever filters change
  useEffect(() => {
    writeFiltersToUrl(filters);
  }, [filters]);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <MapContent filters={filters} setFilters={setFilters} />
      </div>
    </APIProvider>
  );
}
