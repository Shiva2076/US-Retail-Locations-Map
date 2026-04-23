import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { StateCount } from '../types';
import { formatCount, getStateAbbreviation } from '../utils/helpers';

interface StateMarkersProps {
  stateCounts: StateCount[];
}

export default function StateMarkers({ stateCounts }: StateMarkersProps) {
  const map = useMap();

  const handleClick = (state: StateCount) => {
    if (!map) return;
    map.panTo({ lat: state.lat, lng: state.lng });
    map.setZoom(6);
  };

  return (
    <>
      {stateCounts.map((state) => (
        <AdvancedMarker
          key={state.state}
          position={{ lat: state.lat, lng: state.lng }}
          onClick={() => handleClick(state)}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '2px solid #1565C0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1565C0', lineHeight: 1 }}>
              {getStateAbbreviation(state.state)}
            </span>
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#333', lineHeight: 1.2 }}>
              {formatCount(state.count)}
            </span>
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}
