import { useState } from 'react';
import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Store } from '../types';
import { getBrandColor, getStatusColor } from '../utils/helpers';

interface StoreMarkersProps {
  stores: Store[];
}

export default function StoreMarkers({ stores }: StoreMarkersProps) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  return (
    <>
      {stores.map((store) => {
        const color = getBrandColor(store.brand_initial);
        return (
          <AdvancedMarker
            key={store.storeId}
            position={{ lat: store.lat, lng: store.lng }}
            onClick={() => setSelectedStore(store)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: color,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  border: '2px solid white',
                  userSelect: 'none',
                }}
              >
                {store.brand_initial}
              </div>
              {/* Triangle pointer */}
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: `8px solid ${color}`,
                }}
              />
            </div>
          </AdvancedMarker>
        );
      })}

      {selectedStore && (
        <InfoWindow
          position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
          onCloseClick={() => setSelectedStore(null)}
          pixelOffset={[0, -48]}
        >
          <div style={{ padding: '4px 8px', minWidth: '160px', fontFamily: 'inherit' }}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: getBrandColor(selectedStore.brand_initial),
                textAlign: 'center',
                marginBottom: '6px',
              }}
            >
              {selectedStore.brand_initial}
            </div>

            <div style={{ fontSize: '13px', color: '#333', marginBottom: '2px' }}>
              <strong>{selectedStore.city}</strong>
              {selectedStore.city && selectedStore.state ? ', ' : ''}
              {selectedStore.state}
              {selectedStore.zipcode ? ` ${selectedStore.zipcode}` : ''}
            </div>

            <div style={{ marginTop: '6px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
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

            {selectedStore.type && (
              <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                Type: {selectedStore.type}
              </div>
            )}
            {selectedStore.channel && (
              <div style={{ fontSize: '12px', color: '#555' }}>
                Channel: {selectedStore.channel}
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}
