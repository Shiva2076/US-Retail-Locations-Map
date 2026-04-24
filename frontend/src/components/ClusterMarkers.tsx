import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { ClusterFeature } from '../types';
import { formatCount, getBrandColor } from '../utils/helpers';

interface ClusterMarkersProps {
  clusters: ClusterFeature[];
}

export default function ClusterMarkers({ clusters }: ClusterMarkersProps) {
  const map = useMap();

  return (
    <>
      {clusters.map((feature, index) => {
        const [lng, lat] = feature.geometry.coordinates;
        const { cluster, cluster_id, point_count, brand_initial } = feature.properties;

        if (cluster) {
          const count = point_count ?? 0;
          const size = Math.min(72, Math.max(40, 40 + Math.log2(count + 1) * 6));
          const fontSize = size > 58 ? '14px' : '12px';

          return (
            <AdvancedMarker
              key={`cluster-${cluster_id}`}
              position={{ lat, lng }}
              onClick={() => {
                if (!map) return;
                const currentZoom = map.getZoom() ?? 5;
                map.panTo({ lat, lng });
                map.setZoom(currentZoom + 2);
              }}
            >
              <div
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: '50%',
                  backgroundColor: '#1a1a2e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.45)',
                  border: '2px solid rgba(255,255,255,0.25)',
                  userSelect: 'none',
                }}
              >
                {formatCount(count)}
              </div>
            </AdvancedMarker>
          );
        }

        // Unclustered individual point at regional zoom —
        // white ring style matching street-level markers, clicks zoom to street level
        const color = getBrandColor(brand_initial ?? '');
        return (
          <AdvancedMarker
            key={`point-${feature.properties.storeId ?? index}`}
            position={{ lat, lng }}
            onClick={() => {
              if (!map) return;
              map.panTo({ lat, lng });
              map.setZoom(14);
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: `2.5px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                fontWeight: 'bold',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                userSelect: 'none',
              }}
            >
              {(brand_initial ?? '?')}
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}
