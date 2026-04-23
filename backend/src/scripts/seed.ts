import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Store } from '../models/Store';

dotenv.config();

interface CsvRow {
  id: string;
  brand_initial: string;
  latitude: string;
  longitude: string;
  state: string;
  city: string;
  zipcode: string;
  status: string;
  type: string;
  channel: string;
}

interface StoreSeedDoc {
  storeId: string;
  brand_initial: string;
  location: { type: 'Point'; coordinates: [number, number] };
  state: string;
  city: string;
  zipcode: string;
  status: string;
  type: string;
  channel: string;
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await Store.collection.drop().catch(() => {
    console.log('Collection did not exist, starting fresh');
  });
  console.log('Dropped existing stores collection');

  const csvPath = path.join(process.cwd(), 'data', 'stores.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    console.error('Please create backend/data/stores.csv before running seed');
    process.exit(1);
  }

  const validDocs: StoreSeedDoc[] = [];
  let rowCount = 0;
  let skippedCount = 0;

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: CsvRow) => {
        rowCount++;

        const lat = parseFloat(row.latitude);
        const lng = parseFloat(row.longitude);

        if (!row.latitude || !row.longitude || isNaN(lat) || isNaN(lng)) {
          skippedCount++;
          return;
        }

        validDocs.push({
          storeId: row.id,
          brand_initial: row.brand_initial,
          location: { type: 'Point', coordinates: [lng, lat] },
          state: row.state,
          city: row.city || '',
          zipcode: row.zipcode || '',
          status: row.status || '',
          type: row.type || '',
          channel: row.channel || '',
        });

        if (rowCount % 10000 === 0) {
          console.log(`Processed ${rowCount} rows (${validDocs.length} valid so far)...`);
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`\nCSV parsing complete: ${rowCount} rows read, ${skippedCount} skipped`);
  console.log(`Inserting ${validDocs.length} documents in batches of 1000...`);

  let totalInserted = 0;
  const batchSize = 1000;

  for (let i = 0; i < validDocs.length; i += batchSize) {
    const chunk = validDocs.slice(i, i + batchSize);
    await Store.insertMany(chunk, { ordered: false });
    totalInserted += chunk.length;

    if (totalInserted % 10000 === 0 || totalInserted === validDocs.length) {
      console.log(`Inserted ${totalInserted}/${validDocs.length} documents`);
    }
  }

  console.log(`\nSeeding complete. Total inserted: ${totalInserted}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
