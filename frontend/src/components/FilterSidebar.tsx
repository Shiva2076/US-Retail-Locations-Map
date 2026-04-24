import { useState } from 'react';
import type React from 'react';
import { Filters } from '../types';
import SearchBox from './SearchBox';
import { CityResult } from '../utils/api';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

const BRANDS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

interface FilterSidebarProps {
  filters: Partial<Filters>;
  onChange: (filters: Partial<Filters>) => void;
  onCitySelect: (result: CityResult) => void;
}

export default function FilterSidebar({ filters, onChange, onCitySelect }: FilterSidebarProps) {
  const [open, setOpen] = useState(true);

  const hasActiveFilters = !!(filters.state || filters.brand || filters.status);

  return (
    // Outer wrapper — always rendered, slides via CSS class
    <div className={`sidebar-wrap ${open ? '' : 'collapsed'}`}>
      {/* Glassmorphism panel */}
      <div className="glass-panel sidebar-inner">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🗂 Filters
            {hasActiveFilters && <span className="active-dot" />}
          </h3>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              color: 'var(--color-text-muted)',
              padding: '2px 4px',
              lineHeight: 1,
              transition: 'color 0.2s',
            } as React.CSSProperties}
            title="Collapse filters"
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = 'var(--color-text-primary)')}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = 'var(--color-text-muted)')}
          >
            ◀
          </button>
        </div>

        {/* City search */}
        <div>
          <label className="filter-label">Jump to City</label>
          <SearchBox onSelect={onCitySelect} />
        </div>

        <div style={{ height: '1px', background: 'var(--color-border)' }} />

        {/* State filter */}
        <div>
          <label className="filter-label">State</label>
          <div style={{ position: 'relative' }}>
            <select
              className="filter-select"
              value={filters.state ?? ''}
              onChange={(e) => onChange({ ...filters, state: e.target.value || undefined })}
            >
              <option value="">All States</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
            }}>▼</span>
          </div>
        </div>

        {/* Brand filter */}
        <div>
          <label className="filter-label">Brand</label>
          <div style={{ position: 'relative' }}>
            <select
              className="filter-select"
              value={filters.brand ?? ''}
              onChange={(e) => onChange({ ...filters, brand: e.target.value || undefined })}
            >
              <option value="">All Brands</option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <span style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
            }}>▼</span>
          </div>
        </div>

        {/* Status filter */}
        <div>
          <label className="filter-label">Status</label>
          <div style={{ position: 'relative' }}>
            <select
              className="filter-select"
              value={filters.status ?? ''}
              onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
            >
              <option value="">All</option>
              <option value="Active">🟢 Active</option>
              <option value="Closed">🔴 Closed</option>
              <option value="Planned">🟠 Planned</option>
            </select>
            <span style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
            }}>▼</span>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {filters.state && (
              <span style={chipStyle}>
                {filters.state}
                <button style={chipXStyle} onClick={() => onChange({ ...filters, state: undefined })}>✕</button>
              </span>
            )}
            {filters.brand && (
              <span style={chipStyle}>
                Brand: {filters.brand}
                <button style={chipXStyle} onClick={() => onChange({ ...filters, brand: undefined })}>✕</button>
              </span>
            )}
            {filters.status && (
              <span style={chipStyle}>
                {filters.status}
                <button style={chipXStyle} onClick={() => onChange({ ...filters, status: undefined })}>✕</button>
              </span>
            )}
          </div>
        )}

        <div style={{ marginTop: 'auto' }}>
          <button
            className="clear-btn"
            onClick={() => onChange({})}
            disabled={!hasActiveFilters}
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Collapse tab — visible when sidebar is open so user can hide it */}
      <button
        className="sidebar-tab"
        onClick={() => setOpen((o) => !o)}
        title={open ? 'Collapse sidebar' : 'Open filters'}
        aria-label="Toggle filter sidebar"
        id="filter-sidebar-toggle"
      >
        {hasActiveFilters ? '● FILTER' : open ? '◀ HIDE' : '▶ FILTER'}
      </button>
    </div>
  );
}

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '3px 8px',
  background: 'rgba(108, 99, 255, 0.2)',
  border: '1px solid rgba(108, 99, 255, 0.4)',
  borderRadius: '999px',
  fontSize: '11px',
  color: 'var(--color-text-primary)',
  fontFamily: 'Inter, sans-serif',
};

const chipXStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'rgba(240,240,248,0.5)',
  fontSize: '10px',
  padding: 0,
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
};
