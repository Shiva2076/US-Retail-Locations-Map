export type ZoomTier = 'country' | 'regional' | 'street';

export interface ViewportBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

export interface Filters {
  state?: string;
  brand?: string;
  status?: string;
}

export interface StateCount {
  state: string;
  count: number;
  lat: number;
  lng: number;
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
    storeId?: string;
    brand_initial?: string;
    state?: string;
    city?: string;
    status?: string;
    store_type?: string;
  };
}
