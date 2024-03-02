import mongoose, { Schema } from 'mongoose';

export const reviewSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  rating: Number,
});
