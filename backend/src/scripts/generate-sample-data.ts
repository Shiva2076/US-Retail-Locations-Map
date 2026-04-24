/**
 * Generates a sample stores.csv with ~5000 realistic US retail locations.
 * Run: ts-node src/scripts/generate-sample-data.ts
 * Then: npm run seed
 */

import fs from 'fs';
import path from 'path';

// Approximate bounding boxes [minLat, maxLat, minLng, maxLng] per state
const STATE_REGIONS: Record<string, [number, number, number, number]> = {
  Alabama: [30.1, 35.0, -88.5, -84.9],
  Alaska: [54.5, 71.4, -168.0, -130.0],
  Arizona: [31.3, 37.0, -114.8, -109.0],
  Arkansas: [33.0, 36.5, -94.6, -89.6],
  California: [32.5, 42.0, -124.4, -114.1],
  Colorado: [36.9, 41.0, -109.1, -102.0],
  Connecticut: [40.9, 42.1, -73.7, -71.8],
  Delaware: [38.4, 39.8, -75.8, -75.0],
  Florida: [24.5, 31.0, -87.6, -80.0],
  Georgia: [30.3, 35.0, -85.6, -80.8],
  Hawaii: [18.9, 22.2, -160.2, -154.8],
  Idaho: [41.9, 49.0, -117.2, -111.0],
  Illinois: [36.9, 42.5, -91.5, -87.0],
  Indiana: [37.7, 41.8, -88.1, -84.8],
  Iowa: [40.3, 43.5, -96.6, -90.1],
  Kansas: [36.9, 40.0, -102.1, -94.6],
  Kentucky: [36.5, 39.1, -89.6, -81.9],
  Louisiana: [28.9, 33.0, -94.0, -88.8],
  Maine: [43.0, 47.5, -71.1, -67.0],
  Maryland: [37.9, 39.7, -79.5, -75.0],
  Massachusetts: [41.2, 42.9, -73.5, -69.9],
  Michigan: [41.6, 48.3, -90.4, -82.4],
  Minnesota: [43.5, 49.4, -97.2, -89.5],
  Mississippi: [30.1, 35.0, -91.7, -88.1],
  Missouri: [35.9, 40.6, -95.8, -89.1],
  Montana: [44.3, 49.0, -116.1, -104.0],
  Nebraska: [39.9, 43.0, -104.1, -95.3],
  Nevada: [35.0, 42.0, -120.0, -114.0],
  'New Hampshire': [42.7, 45.3, -72.6, -70.7],
  'New Jersey': [38.9, 41.4, -75.6, -73.9],
  'New Mexico': [31.3, 37.0, -109.1, -103.0],
  'New York': [40.5, 45.0, -79.8, -71.9],
  'North Carolina': [33.8, 36.6, -84.3, -75.5],
  'North Dakota': [45.9, 49.0, -104.1, -96.6],
  Ohio: [38.4, 42.3, -84.8, -80.5],
  Oklahoma: [33.6, 37.0, -103.0, -94.4],
  Oregon: [41.9, 46.3, -124.6, -116.5],
  Pennsylvania: [39.7, 42.3, -80.5, -74.7],
  'Rhode Island': [41.1, 42.0, -71.9, -71.1],
  'South Carolina': [32.0, 35.2, -83.4, -78.5],
  'South Dakota': [42.5, 45.9, -104.1, -96.4],
  Tennessee: [34.9, 36.7, -90.3, -81.6],
  Texas: [25.8, 36.5, -106.6, -93.5],
  Utah: [36.9, 42.0, -114.1, -109.0],
  Vermont: [42.7, 45.0, -73.4, -71.5],
  Virginia: [36.5, 39.5, -83.7, -75.2],
  Washington: [45.5, 49.0, -124.7, -116.9],
  'West Virginia': [37.2, 40.6, -82.6, -77.7],
  Wisconsin: [42.5, 47.1, -92.9, -86.2],
  Wyoming: [40.9, 45.0, -111.1, -104.0],
  'District of Columbia': [38.79, 38.99, -77.12, -76.91],
};

const CITIES: Record<string, string[]> = {
  California: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'Fresno', 'Long Beach', 'Oakland', 'Bakersfield'],
  Texas: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi'],
  Florida: ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale'],
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon'],
  Pennsylvania: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem'],
  Illinois: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Peoria'],
  Ohio: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'],
  Georgia: ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens'],
  Michigan: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing', 'Ann Arbor'],
  Washington: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Olympia'],
};

const STATUSES = ['Active', 'Active', 'Active', 'Active', 'Closed', 'Planned'];
const TYPES = ['Retail', 'Warehouse', 'Outlet', 'Flagship', 'Express', 'Superstore'];
const CHANNELS = ['In-Store', 'Online', 'Both', 'In-Store', 'In-Store'];
const BRANDS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateZip(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

const states = Object.keys(STATE_REGIONS);

// Weight states by approximate real store density
const STATE_WEIGHTS: Record<string, number> = {
  California: 12, Texas: 11, Florida: 10, 'New York': 9, Pennsylvania: 6,
  Illinois: 6, Ohio: 5, Georgia: 5, Michigan: 4, Washington: 4,
  'North Carolina': 4, Arizona: 4, Tennessee: 4, Colorado: 3, Virginia: 3,
  Massachusetts: 3, Indiana: 3, Wisconsin: 3, Minnesota: 3, Missouri: 3,
  Maryland: 2, Louisiana: 2, Alabama: 2, 'South Carolina': 2, Kentucky: 2,
  Oregon: 2, Oklahoma: 2, Connecticut: 2, Arkansas: 1, Iowa: 1,
  Mississippi: 1, Kansas: 1, Nevada: 1, Utah: 1, Nebraska: 1,
  'New Mexico': 1, Idaho: 1, 'West Virginia': 1, Montana: 1, Wyoming: 1,
  'North Dakota': 1, 'South Dakota': 1, Maine: 1, Vermont: 1, Alaska: 1,
  Hawaii: 1, Delaware: 1, 'Rhode Island': 1, 'New Hampshire': 1,
  'New Jersey': 3, 'District of Columbia': 1,
};

// Build weighted state pool
const statePool: string[] = [];
for (const [state, weight] of Object.entries(STATE_WEIGHTS)) {
  for (let i = 0; i < weight; i++) statePool.push(state);
}

const TOTAL = 5000;
const rows: string[] = ['id,brand_initial,latitude,longitude,state,city,zipcode,status,type,channel'];

for (let i = 1; i <= TOTAL; i++) {
  const state = pick(statePool);
  const [minLat, maxLat, minLng, maxLng] = STATE_REGIONS[state] ?? [35, 45, -100, -80];
  const lat = rand(minLat, maxLat).toFixed(6);
  const lng = rand(minLng, maxLng).toFixed(6);
  const citiesForState = CITIES[state];
  const city = citiesForState ? pick(citiesForState) : state.split(' ')[0] + ' City';
  const brand = pick(BRANDS);
  const status = pick(STATUSES);
  const type = pick(TYPES);
  const channel = pick(CHANNELS);
  const zip = generateZip();

  rows.push(`${i},${brand},${lat},${lng},${state},${city},${zip},${status},${type},${channel}`);
}

const outPath = path.join(process.cwd(), 'data', 'stores.csv');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, rows.join('\n'), 'utf-8');
console.log(`✓ Generated ${TOTAL} sample stores → ${outPath}`);
console.log('Now run: npm run seed');
