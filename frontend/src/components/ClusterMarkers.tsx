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
          // Scale from 40px (small clusters) to 80px (large clusters)
          const size = Math.min(80, Math.max(40, 40 + Math.log2(count + 1) * 7));

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
                  background: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: size > 60 ? '14px' : '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                  border: '2px solid rgba(255,255,255,0.6)',
                  userSelect: 'none',
                }}
              >
                {formatCount(count)}
              </div>
            </AdvancedMarker>
          );
        }

        return (
          <AdvancedMarker
            key={`point-${feature.properties.storeId ?? index}`}
            position={{ lat, lng }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getBrandColor(brand_initial ?? ''),
                border: '1.5px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                cursor: 'pointer',
              }}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}
