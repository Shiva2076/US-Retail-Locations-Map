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
      // Zoom into street level if not already there
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
              style={{
                width: isSelected ? '44px' : '38px',
                height: isSelected ? '44px' : '38px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: `3px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                fontWeight: 'bold',
                fontSize: isSelected ? '17px' : '15px',
                cursor: 'pointer',
                boxShadow: isSelected
                  ? `0 0 0 3px ${color}40, 0 4px 12px rgba(0,0,0,0.4)`
                  : '0 2px 6px rgba(0,0,0,0.3)',
                transition: 'all 0.15s ease',
                userSelect: 'none',
                letterSpacing: '-0.5px',
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
          pixelOffset={[0, -24]}
        >
          <div style={{ padding: '4px 6px', minWidth: '160px', fontFamily: 'inherit' }}>
            {/* Brand circle */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: `3px solid ${getBrandColor(selectedStore.brand_initial)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getBrandColor(selectedStore.brand_initial),
                fontWeight: 'bold',
                fontSize: '22px',
                margin: '0 auto 8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              {selectedStore.brand_initial}
            </div>

            <div style={{ fontSize: '13px', color: '#222', marginBottom: '2px', textAlign: 'center' }}>
              <strong>
                {selectedStore.city}
                {selectedStore.city && selectedStore.state ? ', ' : ''}
                {selectedStore.state}
              </strong>
            </div>

            {selectedStore.zipcode && (
              <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '6px' }}>
                {selectedStore.zipcode}
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '6px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  backgroundColor: getStatusColor(selectedStore.status),
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              >
                {selectedStore.status || 'Unknown'}
              </span>
            </div>

            {(selectedStore.type || selectedStore.channel) && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#555',
                  borderTop: '1px solid #eee',
                  paddingTop: '6px',
                  marginTop: '2px',
                }}
              >
                {selectedStore.type && (
                  <div>Type: <strong>{selectedStore.type}</strong></div>
                )}
                {selectedStore.channel && (
                  <div>Channel: <strong>{selectedStore.channel}</strong></div>
                )}
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}
