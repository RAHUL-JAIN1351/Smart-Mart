// models/Product.js
import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const reviewSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const productSchema = new Schema({
  name: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, index: true },
  image: { type: String, required: true },
  images: [String],
  brand: { type: String, default: 'SmartMart' },
  stock: { type: Number, required: true, default: 0 },
  sold: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  isTrending: { type: Boolean, default: false, index: true },
  isFlashSale: { type: Boolean, default: false, index: true },
  flashSalePrice: { type: Number, default: null },
  flashSaleEndsAt: { type: Date, default: null },
  tags: [{ type: String, index: true }],
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Text and compound indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isTrending: 1, rating: -1 });

const Product = model('Product', productSchema);

export default Product;