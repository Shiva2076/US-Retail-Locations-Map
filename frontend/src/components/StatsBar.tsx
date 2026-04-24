import { useMemo } from 'react';
import { ZoomTier, StateCount, ClusterFeature, Store } from '../types';
import { formatCount } from '../utils/helpers';

interface StatsBarProps {
  tier: ZoomTier;
  stateCounts: StateCount[];
  clusters: ClusterFeature[];
  stores: Store[];
  loading: boolean;
}

function dot(color: string) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: '4px',
        verticalAlign: 'middle',
      }}
    />
  );
}

export default function StatsBar({ tier, stateCounts, clusters, stores, loading }: StatsBarProps) {
  const stats = useMemo(() => {
    if (tier === 'country') {
      const total = stateCounts.reduce((s, c) => s + c.count, 0);
      const stateCount = stateCounts.length;
      return { total, label: `across ${stateCount} states`, breakdown: null };
    }

    if (tier === 'regional') {
      // Sum all point_counts (clusters) + 1 per unclustered point
      const total = clusters.reduce(
        (s, c) => s + (c.properties.cluster ? (c.properties.point_count ?? 0) : 1),
        0
      );
      return { total, label: 'in current view', breakdown: null };
    }

    // Street level — full status breakdown
    const total = stores.length;
    const breakdown = stores.reduce<Record<string, number>>((acc, s) => {
      const key = s.status || 'Unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return { total, label: 'stores in view', breakdown };
  }, [tier, stateCounts, clusters, stores]);

  if (loading && stats.total === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(26,26,46,0.92)',
        color: 'white',
        padding: '8px 20px',
        borderRadius: '24px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 5,
        pointerEvents: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(4px)',
        whiteSpace: 'nowrap',
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <span>
        <strong style={{ fontSize: '14px' }}>{formatCount(stats.total)}</strong>{' '}
        <span style={{ opacity: 0.75 }}>{stats.label}</span>
      </span>

      {stats.breakdown && Object.keys(stats.breakdown).length > 0 && (
        <>
          <span style={{ opacity: 0.3 }}>|</span>
          {stats.breakdown['Active'] !== undefined && (
            <span>{dot('#4CAF50')}{stats.breakdown['Active']} Active</span>
          )}
          {stats.breakdown['Closed'] !== undefined && (
            <span>{dot('#F44336')}{stats.breakdown['Closed']} Closed</span>
          )}
          {stats.breakdown['Planned'] !== undefined && (
            <span>{dot('#FF9800')}{stats.breakdown['Planned']} Planned</span>
          )}
          {stats.breakdown['Unknown'] !== undefined && (
            <span>{dot('#9E9E9E')}{stats.breakdown['Unknown']} Unknown</span>
          )}
        </>
      )}
    </div>
  );
}
