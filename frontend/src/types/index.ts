export type ZoomTier = 'country' | 'regional' | 'street';

export function getZoomTier(zoom: number): ZoomTier {
  if (zoom < 5) return 'country';
  if (zoom < 13) return 'regional';
  return 'street';
}

export interface ViewportBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

export interface Filters {
  state: string;
  brand: string;
  status: string;
}

export interface StateCount {
  state: string;
  count: number;
  lat: number;
  lng: number;
}

export interface Store {
  storeId: string;
  brand_initial: string;
  lat: number;
  lng: number;
  state: string;
  city: string;
  zipcode: string;
  status: string;
  type: string;
  channel: string;
}

export interface ClusterFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    cluster: boolean;
    cluster_id?: number;
    point_count?: number;
    expansion_zoom?: number;
    storeId?: string;
    brand_initial?: string;
    state?: string;
    city?: string;
    status?: string;
    store_type?: string;
  };
}
