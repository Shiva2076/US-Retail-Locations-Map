import { useState, useRef, useEffect, useCallback } from 'react';
import { fetchCitySearch, CityResult } from '../utils/api';
import { useDebounce } from '../hooks/useDebounce';

interface SearchBoxProps {
  onSelect: (result: CityResult) => void;
}

export default function SearchBox({ onSelect }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 280);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchCitySearch(debouncedQuery)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setOpen(data.length > 0);
        }
      })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelect = useCallback((result: CityResult) => {
    setQuery(`${result.city}, ${result.state}`);
    setOpen(false);
    onSelect(result);
  }, [onSelect]);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '13px',
            color: 'rgba(240,240,248,0.45)',
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          className="search-input"
          type="text"
          placeholder="Search city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          style={{ paddingLeft: '30px' }}
          aria-label="Search for a city"
          id="city-search-input"
        />
        {loading && (
          <span
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '10px',
              color: 'rgba(240,240,248,0.4)',
            }}
          >
            ⏳
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="search-suggestions">
          {results.map((r) => (
            <div
              key={`${r.city}-${r.state}`}
              className="search-suggestion-item"
              onMouseDown={() => handleSelect(r)}
              role="option"
              aria-selected={false}
            >
              <span>{r.city}</span>
              <span className="search-suggestion-state">{r.state}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
