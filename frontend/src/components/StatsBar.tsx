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

function StatusDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: '4px',
        verticalAlign: 'middle',
        flexShrink: 0,
      }}
    />
  );
}

export default function StatsBar({ tier, stateCounts, clusters, stores, loading }: StatsBarProps) {
  const stats = useMemo(() => {
    if (tier === 'country') {
      const total = stateCounts.reduce((s, c) => s + c.count, 0);
      const stateCount = stateCounts.length;
      return { total, label: `across ${stateCount} state${stateCount !== 1 ? 's' : ''}`, breakdown: null };
    }

    if (tier === 'regional') {
      const total = clusters.reduce(
        (s, c) => s + (c.properties.cluster ? (c.properties.point_count ?? 0) : 1),
        0
      );
      return { total, label: 'in current view', breakdown: null };
    }

    // Street — full status breakdown
    const total = stores.length;
    const breakdown = stores.reduce<Record<string, number>>((acc, s) => {
      const key = s.status || 'Unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return { total, label: 'stores in view', breakdown };
  }, [tier, stateCounts, clusters, stores]);

  if (loading && stats.total === 0) return null;

  const STATUS_COLORS: Record<string, string> = {
    Active:  'var(--color-success)',
    Closed:  'var(--color-danger)',
    Planned: 'var(--color-warning)',
    Unknown: 'var(--color-unknown)',
  };

  return (
    <div
      className={loading ? 'stats-shimmer' : ''}
      style={{
        position: 'absolute',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: loading ? 'var(--color-surface)' : 'var(--color-surface)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)',
        padding: '9px 22px',
        borderRadius: 'var(--radius-full)',
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        zIndex: 5,
        pointerEvents: 'none',
        boxShadow: 'var(--shadow-soft)',
        whiteSpace: 'nowrap',
        opacity: loading ? 0.65 : 1,
        transition: 'opacity 0.25s ease',
      }}
    >
      <span>
        <strong style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}>
          {formatCount(stats.total)}
        </strong>{' '}
        <span style={{ color: 'var(--color-text-muted)' }}>{stats.label}</span>
      </span>

      {stats.breakdown && Object.keys(stats.breakdown).length > 0 && (
        <>
          <span style={{ opacity: 0.2, fontSize: '16px' }}>|</span>
          {(['Active', 'Closed', 'Planned', 'Unknown'] as const).map((status) =>
            stats.breakdown![status] != null ? (
              <span key={status} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <StatusDot color={STATUS_COLORS[status]} />
                {stats.breakdown![status]} {status}
              </span>
            ) : null
          )}
        </>
      )}
    </div>
  );
}
