import { useState, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
  useMap,
} from '@vis.gl/react-google-maps';
import { Filters, ViewportBounds } from '../types';
import { useMapData } from '../hooks/useMapData';
import { CityResult } from '../utils/api';
import StateMarkers from './StateMarkers';
import ClusterMarkers from './ClusterMarkers';
import StoreMarkers from './StoreMarkers';
import FilterSidebar from './FilterSidebar';
import LoadingOverlay from './LoadingOverlay';
import StatsBar from './StatsBar';
import ErrorBanner from './ErrorBanner';

// ── URL persistence ──────────────────────────────────────────
function readFiltersFromUrl(): Partial<Filters> {
  const p = new URLSearchParams(window.location.search);
  const f: Partial<Filters> = {};
  const state = p.get('state'); if (state) f.state = state as Filters['state'];
  const brand = p.get('brand'); if (brand) f.brand = brand as Filters['brand'];
  const status = p.get('status'); if (status) f.status = status as Filters['status'];
  return f;
}

function writeFiltersToUrl(filters: Partial<Filters>) {
  const p = new URLSearchParams();
  if (filters.state) p.set('state', filters.state);
  if (filters.brand) p.set('brand', filters.brand);
  if (filters.status) p.set('status', filters.status);
  const qs = p.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

// ── Reset View ───────────────────────────────────────────────
function ResetViewButton() {
  const map = useMap();
  return (
    <button
      className="reset-btn"
      onClick={() => {
        if (!map) return;
        map.panTo({ lat: 39.5, lng: -98.35 });
        map.setZoom(4);
      }}
      title="Reset to full US view"
      id="reset-view-btn"
    >
      ↺ Reset View
    </button>
  );
}

// ── Interactive Tier Legend ──────────────────────────────────
const TIER_META: Record<string, { label: string; color: string }> = {
  country:  { label: '🗺 Country',  color: '#6c63ff' },
  regional: { label: '🔍 Regional', color: '#3949ab' },
  street:   { label: '📍 Street',   color: '#00897b' },
};

const TIER_THRESHOLDS = [
  { tier: 'country',  range: 'zoom < 5',    desc: 'State-level counts' },
  { tier: 'regional', range: 'zoom 5–12',   desc: 'Clustered groups' },
  { tier: 'street',   range: 'zoom ≥ 13',   desc: 'Individual stores' },
];

function TierLegend({ tier }: { tier: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const meta = TIER_META[tier] ?? TIER_META.country;

  return (
    <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 5 }}>
      <button
        className="tier-badge"
        onClick={() => setShowTooltip((v) => !v)}
        onBlur={() => setShowTooltip(false)}
        style={{ borderColor: `${meta.color}66` }}
        id="tier-legend-badge"
        title="Click to see zoom tier info"
      >
        {meta.label}
      </button>

      {showTooltip && (
        <div className="tier-tooltip">
          {TIER_THRESHOLDS.map(({ tier: t, range, desc }) => (
            <div key={t} className={`tier-tooltip-row ${t === tier ? 'active-tier' : ''}`}>
              <span style={{ minWidth: '80px', fontWeight: t === tier ? '700' : '400' }}>
                {TIER_META[t].label}
              </span>
              <span style={{ minWidth: '72px', opacity: 0.7 }}>{range}</span>
              <span style={{ opacity: 0.7 }}>{desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Map Content (inside APIProvider so useMap() works) ───────
function MapContent({
  filters,
  setFilters,
}: {
  filters: Partial<Filters>;
  setFilters: (f: Partial<Filters>) => void;
}) {
  const map = useMap();
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

  // Pan map to city search result
  const handleCitySelect = useCallback((result: CityResult) => {
    if (!map) return;
    map.panTo({ lat: result.lat, lng: result.lng });
    map.setZoom(11);
  }, [map]);

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

      <FilterSidebar filters={filters} onChange={setFilters} onCitySelect={handleCitySelect} />

      {loading && <LoadingOverlay />}
      {error && <ErrorBanner message={error} onRetry={retry} />}

      {isEmpty && !error && (
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-surface)',
            backdropFilter: 'blur(12px)',
            padding: '8px 20px',
            borderRadius: '999px',
            border: '1px solid var(--color-border)',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
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

      <TierLegend tier={tier} />
    </>
  );
}

// ── Root ─────────────────────────────────────────────────────
export default function MapView() {
  const [filters, setFilters] = useState<Partial<Filters>>(readFiltersFromUrl);

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
