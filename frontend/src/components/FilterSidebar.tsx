import { useState } from 'react';
import type React from 'react';
import { Filters } from '../types';

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '600',
  marginBottom: '4px',
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  borderRadius: '4px',
  border: '1px solid #d0d0d0',
  fontSize: '13px',
  background: 'white',
  color: '#333',
  cursor: 'pointer',
  outline: 'none',
};

interface FilterSidebarProps {
  filters: Partial<Filters>;
  onChange: (filters: Partial<Filters>) => void;
}

export default function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const [open, setOpen] = useState(true);

  const hasActiveFilters = !!(filters.state || filters.brand || filters.status);

  return (
    <>
      {/* Collapsed toggle tab */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            background: '#1a1a2e',
            color: 'white',
            border: 'none',
            borderRadius: '0 6px 6px 0',
            padding: '14px 6px',
            cursor: 'pointer',
            zIndex: 10,
            fontSize: '11px',
            fontWeight: 'bold',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            letterSpacing: '1px',
            boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
          }}
        >
          {hasActiveFilters ? '● FILTER' : '▶ FILTER'}
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '220px',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '2px 0 10px rgba(0,0,0,0.15)',
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            zIndex: 10,
            overflowY: 'auto',
          }}
        >
          {/* Header with collapse button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e' }}>
              Filters
              {hasActiveFilters && (
                <span
                  style={{
                    marginLeft: '6px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#E53935',
                    display: 'inline-block',
                  }}
                />
              )}
            </h3>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#888',
                padding: '2px 6px',
                lineHeight: 1,
              }}
              title="Collapse filters"
            >
              ◀
            </button>
          </div>

          <div>
            <label style={labelStyle}>State</label>
            <select
              value={filters.state ?? ''}
              onChange={(e) => onChange({ ...filters, state: e.target.value || undefined })}
              style={selectStyle}
            >
              <option value="">All States</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Brand</label>
            <select
              value={filters.brand ?? ''}
              onChange={(e) => onChange({ ...filters, brand: e.target.value || undefined })}
              style={selectStyle}
            >
              <option value="">All Brands</option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={filters.status ?? ''}
              onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
              style={selectStyle}
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="Planned">Planned</option>
            </select>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={() => onChange({})}
              style={{
                width: '100%',
                padding: '8px',
                background: '#1a1a2e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                opacity: hasActiveFilters ? 1 : 0.5,
              }}
              disabled={!hasActiveFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}
