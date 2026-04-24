import { Router, Request, Response } from 'express';
import Supercluster from 'supercluster';
import { Store } from '../models/Store';
import { stateCentroids } from '../utils/stateCentroids';
import { StateCount } from '../types';

const router = Router();

interface PointProps {
  storeId: string;
  brand_initial: string;
  state: string;
  city: string;
  status: string;
  store_type: string;
}

interface PointLean {
  storeId: string;
  brand_initial: string;
  location: { type: string; coordinates: number[] };
  state: string;
  city?: string;
  status: string;
  type?: string;
}

interface StoreLean {
  storeId: string;
  brand_initial: string;
  location: { type: string; coordinates: number[] };
  state: string;
  city?: string;
  zipcode?: string;
  status: string;
  type?: string;
  channel?: string;
}

function buildMatchFilter(brand?: string, status?: string, state?: string): Record<string, unknown> {
  const match: Record<string, unknown> = {};
  if (brand && typeof brand === 'string') match.brand_initial = brand;
  if (status && typeof status === 'string') match.status = status;
  if (state && typeof state === 'string') match.state = state;
  return match;
}

// GET /api/stores/state-counts
router.get('/state-counts', async (req: Request, res: Response) => {
  try {
    const { brand, status } = req.query;
    const matchFilter = buildMatchFilter(
      brand as string | undefined,
      status as string | undefined
    );

    const result = await Store.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const stateCounts: StateCount[] = result
      .map((item: { _id: string; count: number }) => {
        const centroid = stateCentroids[item._id];
        if (!centroid) return null;
        return {
          state: item._id,
          count: item.count,
          lat: centroid.lat,
          lng: centroid.lng,
        };
      })
      .filter((item): item is StateCount => item !== null);

    res.json(stateCounts);
  } catch (err) {
    console.error('/state-counts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stores/clusters
// Returns Supercluster GeoJSON features, each cluster has an `expansion_zoom` property
// so the frontend can zoom to precisely the right level to break that cluster apart.
router.get('/clusters', async (req: Request, res: Response) => {
  try {
    const { swLat, swLng, neLat, neLng, zoom, state, brand, status } = req.query;

    const swLatNum = parseFloat(swLat as string);
    const swLngNum = parseFloat(swLng as string);
    const neLatNum = parseFloat(neLat as string);
    const neLngNum = parseFloat(neLng as string);
    const zoomNum = parseFloat(zoom as string);

    if ([swLatNum, swLngNum, neLatNum, neLngNum, zoomNum].some(isNaN)) {
      res.status(400).json({ error: 'Invalid bounds or zoom parameters' });
      return;
    }

    const geoFilter: Record<string, unknown> = {
      location: {
        $geoWithin: {
          $box: [[swLngNum, swLatNum], [neLngNum, neLatNum]],
        },
      },
    };

    const extraFilter = buildMatchFilter(
      brand as string | undefined,
      status as string | undefined,
      state as string | undefined
    );

    const query = { ...geoFilter, ...extraFilter };

    const points = await Store.find(query)
      .limit(8000)
      .select('location brand_initial state city status type storeId')
      .lean<PointLean[]>();

    const features: Array<{
      type: 'Feature';
      geometry: { type: 'Point'; coordinates: [number, number] };
      properties: PointProps;
    }> = points.map((p) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.location.coordinates[0], p.location.coordinates[1]] as [number, number],
      },
      properties: {
        storeId: p.storeId,
        brand_initial: p.brand_initial,
        state: p.state || '',
        city: p.city || '',
        status: p.status || '',
        store_type: p.type || '',
      },
    }));

    const sc = new Supercluster<PointProps>({ radius: 80, maxZoom: 16, minZoom: 0 });
    sc.load(features);

    const floorZoom = Math.floor(zoomNum);
    const clusters = sc.getClusters([swLngNum, swLatNum, neLngNum, neLatNum], floorZoom);

    // Annotate each cluster with the exact zoom needed to expand it.
    // getClusterExpansionZoom returns the minimum zoom at which the cluster splits —
    // this is far more accurate than a fixed +2 offset.
    const annotated = clusters.map((f) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const props = f.properties as any;
      if (props.cluster && props.cluster_id != null) {
        try {
          const expansionZoom = sc.getClusterExpansionZoom(props.cluster_id as number);
          return {
            ...f,
            properties: {
              ...f.properties,
              expansion_zoom: Math.min(expansionZoom + 1, 16),
            },
          };
        } catch {
          // cluster_id not found — safe fallback
          return {
            ...f,
            properties: { ...f.properties, expansion_zoom: Math.min(floorZoom + 2, 16) },
          };
        }
      }
      return f;
    });

    res.json(annotated);
  } catch (err) {
    console.error('/clusters error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stores/street
router.get('/street', async (req: Request, res: Response) => {
  try {
    const { swLat, swLng, neLat, neLng, state, brand, status } = req.query;

    const swLatNum = parseFloat(swLat as string);
    const swLngNum = parseFloat(swLng as string);
    const neLatNum = parseFloat(neLat as string);
    const neLngNum = parseFloat(neLng as string);

    if ([swLatNum, swLngNum, neLatNum, neLngNum].some(isNaN)) {
      res.status(400).json({ error: 'Invalid bounds parameters' });
      return;
    }

    const geoFilter: Record<string, unknown> = {
      location: {
        $geoWithin: {
          $box: [[swLngNum, swLatNum], [neLngNum, neLatNum]],
        },
      },
    };

    const extraFilter = buildMatchFilter(
      brand as string | undefined,
      status as string | undefined,
      state as string | undefined
    );

    const query = { ...geoFilter, ...extraFilter };

    const stores = await Store.find(query)
      .limit(300)
      .select('storeId brand_initial state city zipcode status type channel location')
      .lean<StoreLean[]>();

    const result = stores.map((s) => ({
      storeId: s.storeId,
      brand_initial: s.brand_initial,
      state: s.state,
      city: s.city || '',
      zipcode: s.zipcode || '',
      status: s.status || '',
      type: s.type || '',
      channel: s.channel || '',
      lat: s.location.coordinates[1],
      lng: s.location.coordinates[0],
    }));

    res.json(result);
  } catch (err) {
    console.error('/street error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stores/search?q=seattle
// Returns up to 8 unique city suggestions matching the query (case-insensitive prefix).
// Each result has { city, state, lat, lng } so the frontend can pan the map.
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string | undefined)?.trim();
    if (!q || q.length < 2) {
      res.json([]);
      return;
    }

    // Case-insensitive prefix match on city field
    const regex = new RegExp(`^${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

    const matches = await Store.aggregate([
      { $match: { city: regex } },
      {
        $group: {
          _id: { city: '$city', state: '$state' },
          lat: { $first: { $arrayElemAt: ['$location.coordinates', 1] } },
          lng: { $first: { $arrayElemAt: ['$location.coordinates', 0] } },
        },
      },
      { $sort: { '_id.city': 1 } },
      { $limit: 8 },
    ]);

    const results = matches.map((m: { _id: { city: string; state: string }; lat: number; lng: number }) => ({
      city: m._id.city,
      state: m._id.state,
      lat: m.lat,
      lng: m.lng,
    }));

    res.json(results);
  } catch (err) {
    console.error('/search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
