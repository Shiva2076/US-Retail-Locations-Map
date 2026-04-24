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
        const { cluster, cluster_id, point_count, brand_initial, expansion_zoom } = feature.properties as {
          cluster?: boolean;
          cluster_id?: number;
          point_count?: number;
          brand_initial?: string;
          expansion_zoom?: number;
          storeId?: string;
          state?: string;
          city?: string;
          status?: string;
        };

        if (cluster) {
          const count = point_count ?? 0;
          // Log-scale sizing: 42px for small clusters, 78px for very large
          const size = Math.min(78, Math.max(42, 42 + Math.log2(count + 1) * 5.5));
          const fontSize = size > 64 ? '14px' : size > 52 ? '13px' : '12px';

          // Size-based color: small=blue-gray, medium=indigo, large=violet
          const bgColor =
            count > 500 ? '#4527a0' :
            count > 100 ? '#3949ab' :
            count > 20  ? '#1e3a8a' :
                          '#1a1a2e';

          return (
            <AdvancedMarker
              key={`cluster-${cluster_id}`}
              position={{ lat, lng }}
              onClick={() => {
                if (!map) return;
                map.panTo({ lat, lng });
                // Use server-computed expansion_zoom for precise cluster breakup.
                // Falls back to currentZoom+2 only if missing.
                const targetZoom =
                  expansion_zoom != null
                    ? expansion_zoom
                    : Math.min((map.getZoom() ?? 5) + 2, 16);
                map.setZoom(targetZoom);
              }}
            >
              <div
                className="marker-enter cluster-pulse"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, ${bgColor}dd, ${bgColor})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  border: '2px solid rgba(255,255,255,0.2)',
                  userSelect: 'none',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                }}
              >
                {formatCount(count)}
              </div>
            </AdvancedMarker>
          );
        }

        // Unclustered individual point at regional zoom
        const color = getBrandColor(brand_initial ?? '');
        return (
          <AdvancedMarker
            key={`point-${(feature.properties.storeId as string | undefined) ?? index}`}
            position={{ lat, lng }}
            onClick={() => {
              if (!map) return;
              map.panTo({ lat, lng });
              map.setZoom(14);
            }}
          >
            <div
              className="marker-enter"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: `2.5px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                userSelect: 'none',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
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
