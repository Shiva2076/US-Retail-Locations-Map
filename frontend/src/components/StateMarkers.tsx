import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { StateCount } from '../types';
import { formatCount, getStateAbbreviation } from '../utils/helpers';

interface StateMarkersProps {
  stateCounts: StateCount[];
}

// Log-scale sizing: min 44px for tiny states, max 84px for the largest.
// This creates a data-viz treemap aesthetic where CA/TX visually dominate.
function getMarkerSize(count: number, maxCount: number): number {
  if (maxCount === 0) return 52;
  const ratio = Math.log(count + 1) / Math.log(maxCount + 1);
  return Math.round(44 + ratio * 40); // 44–84px
}

// Top-N states get an accent ring to draw attention
function isTopState(rank: number): boolean {
  return rank < 5;
}

export default function StateMarkers({ stateCounts }: StateMarkersProps) {
  const map = useMap();
  const maxCount = stateCounts.length > 0 ? stateCounts[0].count : 1; // already sorted desc

  const handleClick = (state: StateCount) => {
    if (!map) return;
    map.panTo({ lat: state.lat, lng: state.lng });
    map.setZoom(6);
  };

  return (
    <>
      {stateCounts.map((state, rank) => {
        const size = getMarkerSize(state.count, maxCount);
        const top5 = isTopState(rank);
        const fontSize = size > 66 ? '13px' : size > 54 ? '12px' : '11px';
        const countFontSize = size > 66 ? '11px' : '10px';

        return (
          <AdvancedMarker
            key={state.state}
            position={{ lat: state.lat, lng: state.lng }}
            onClick={() => handleClick(state)}
          >
            <div
              className="marker-enter"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                // Radial gradient: bright center fades to tinted edge
                background: top5
                  ? 'radial-gradient(circle at 35% 35%, #ffffff 0%, #e8e8ff 60%, #d0d0f5 100%)'
                  : 'radial-gradient(circle at 35% 35%, #ffffff 0%, #f0f0f0 70%, #e0e0e8 100%)',
                border: top5
                  ? '2.5px solid #6c63ff'
                  : '2px solid #3a3a5a',
                boxShadow: top5
                  ? '0 3px 14px rgba(108,99,255,0.4), 0 1px 4px rgba(0,0,0,0.2)'
                  : '0 2px 8px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
              }}
            >
              <span
                style={{
                  fontSize,
                  fontWeight: '800',
                  color: top5 ? '#3a2fa0' : '#1a1a2e',
                  lineHeight: 1,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {getStateAbbreviation(state.state)}
              </span>
              <span
                style={{
                  fontSize: countFontSize,
                  fontWeight: '600',
                  color: top5 ? '#5548c8' : '#444',
                  lineHeight: 1.3,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {formatCount(state.count)}
              </span>
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}
