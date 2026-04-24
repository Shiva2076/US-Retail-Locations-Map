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
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '2px solid #1a1a2e',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1a1a2e', lineHeight: 1 }}>
              {getStateAbbreviation(state.state)}
            </span>
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#444', lineHeight: 1.3 }}>
              {formatCount(state.count)}
            </span>
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}
