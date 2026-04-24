import { useState } from 'react';
import { AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Store } from '../types';
import { getBrandColor, getStatusColor } from '../utils/helpers';

interface StoreMarkersProps {
  stores: Store[];
}

export default function StoreMarkers({ stores }: StoreMarkersProps) {
  const map = useMap();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const handleClick = (store: Store) => {
    if (map) {
      map.panTo({ lat: store.lat, lng: store.lng });
      const currentZoom = map.getZoom() ?? 13;
      if (currentZoom < 16) map.setZoom(16);
    }
    setSelectedStore(store);
  };

  return (
    <>
      {stores.map((store) => {
        const color = getBrandColor(store.brand_initial);
        const isSelected = selectedStore?.storeId === store.storeId;

        return (
          <AdvancedMarker
            key={store.storeId}
            position={{ lat: store.lat, lng: store.lng }}
            onClick={() => handleClick(store)}
          >
            <div
              className="marker-enter"
              style={{
                width: isSelected ? '46px' : '38px',
                height: isSelected ? '46px' : '38px',
                borderRadius: '50%',
                background: isSelected
                  ? `radial-gradient(circle at 35% 35%, #ffffff, ${color}20)`
                  : 'radial-gradient(circle at 35% 35%, #ffffff, #f8f8f8)',
                border: `3px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                fontWeight: '800',
                fontFamily: 'Inter, sans-serif',
                fontSize: isSelected ? '18px' : '15px',
                cursor: 'pointer',
                boxShadow: isSelected
                  ? `0 0 0 4px ${color}30, 0 6px 16px rgba(0,0,0,0.4)`
                  : '0 2px 8px rgba(0,0,0,0.28)',
                transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.2)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
              }}
            >
              {store.brand_initial}
            </div>
          </AdvancedMarker>
        );
      })}

      {selectedStore && (
        <InfoWindow
          position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
          onCloseClick={() => setSelectedStore(null)}
          pixelOffset={[0, -26]}
        >
          <div
            style={{
              padding: '8px 10px',
              minWidth: '170px',
              fontFamily: 'Inter, -apple-system, sans-serif',
              background: 'white',
            }}
          >
            {/* Brand badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, #fff, ${getBrandColor(selectedStore.brand_initial)}18)`,
                  border: `3px solid ${getBrandColor(selectedStore.brand_initial)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: getBrandColor(selectedStore.brand_initial),
                  fontWeight: '800',
                  fontSize: '24px',
                  boxShadow: `0 3px 10px ${getBrandColor(selectedStore.brand_initial)}40`,
                }}
              >
                {selectedStore.brand_initial}
              </div>
            </div>

            {/* Location */}
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#111', textAlign: 'center', marginBottom: '2px' }}>
              {selectedStore.city}
              {selectedStore.city && selectedStore.state ? ', ' : ''}
              {selectedStore.state}
            </div>

            {selectedStore.zipcode && (
              <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginBottom: '8px' }}>
                {selectedStore.zipcode}
              </div>
            )}

            {/* Status pill */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 12px',
                  borderRadius: '999px',
                  background: getStatusColor(selectedStore.status),
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '0.3px',
                }}
              >
                {selectedStore.status || 'Unknown'}
              </span>
            </div>

            {/* Meta rows */}
            {(selectedStore.type || selectedStore.channel) && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#555',
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                }}
              >
                {selectedStore.type && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#999' }}>Type</span>
                    <strong>{selectedStore.type}</strong>
                  </div>
                )}
                {selectedStore.channel && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#999' }}>Channel</span>
                    <strong>{selectedStore.channel}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}
