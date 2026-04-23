import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  storeId: string;
  brand_initial: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  state: string;
  city: string;
  zipcode: string;
  status: string;
  type: string;
  channel: string;
}

const StoreSchema = new Schema<IStore>({
  storeId: { type: String, required: true, unique: true },
  brand_initial: { type: String, required: true, index: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
  state: { type: String, required: true, index: true },
  city: { type: String },
  zipcode: { type: String },
  status: { type: String, index: true },
  type: { type: String },
  channel: { type: String },
});

StoreSchema.index({ location: '2dsphere' });
StoreSchema.index({ state: 1, brand_initial: 1, status: 1 });

export const Store = mongoose.model<IStore>('Store', StoreSchema);
