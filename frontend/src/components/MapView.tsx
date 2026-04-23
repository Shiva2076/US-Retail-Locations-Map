import { useState } from 'react';
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
} from '@vis.gl/react-google-maps';
import { Filters, ViewportBounds } from '../types';
import { useMapData } from '../hooks/useMapData';
import StateMarkers from './StateMarkers';
import ClusterMarkers from './ClusterMarkers';
import StoreMarkers from './StoreMarkers';
import FilterSidebar from './FilterSidebar';
import LoadingOverlay from './LoadingOverlay';

const TIER_COLORS: Record<string, string> = {
  country: '#2E7D32',
  regional: '#1565C0',
  street: '#6A1B9A',
};

export default function MapView() {
  const [zoom, setZoom] = useState(4);
  const [bounds, setBounds] = useState<ViewportBounds | null>(null);
  const [filters, setFilters] = useState<Partial<Filters>>({});

  const { stateCounts, clusters, stores, loading, tier } = useMapData(
    bounds,
    zoom,
    filters
  );

  // True when the fetch completed but returned nothing for the current tier
  const isEmpty =
    !loading &&
    ((tier === 'country' && stateCounts.length === 0) ||
      (tier === 'regional' && clusters.length === 0) ||
      (tier === 'street' && stores.length === 0));

  const handleCameraChanged = (event: MapCameraChangedEvent) => {
    const { detail } = event;
    const b = detail.bounds;
    setZoom(detail.zoom);
    setBounds({
      swLat: b.south,
      swLng: b.west,
      neLat: b.north,
      neLng: b.east,
    });
  };

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
        </Map>

        <FilterSidebar filters={filters} onChange={setFilters} />

        {loading && <LoadingOverlay />}

        {/* Empty state — shown when filters return no data */}
        {isEmpty && (
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
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

        {/* Tier indicator badge */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255,255,255,0.95)',
            padding: '5px 14px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: TIER_COLORS[tier] ?? '#333',
            zIndex: 5,
            borderLeft: `4px solid ${TIER_COLORS[tier] ?? '#333'}`,
          }}
        >
          {tier} view
        </div>
      </div>
    </APIProvider>
  );
}
