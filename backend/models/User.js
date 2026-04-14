// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model, Types } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  loyaltyPoints: { type: Number, default: 0 },
  loyaltyTier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  wishlist: [{ type: Types.ObjectId, ref: 'Product' }],
  preferences: {
    categories: [String],
    lastViewed: [{ type: Types.ObjectId, ref: 'Product' }]
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update loyalty tier based on points
userSchema.methods.updateLoyaltyTier = function () {
  const pts = this.loyaltyPoints;
  if (pts >= 5000) this.loyaltyTier = 'Platinum';
  else if (pts >= 2000) this.loyaltyTier = 'Gold';
  else if (pts >= 500) this.loyaltyTier = 'Silver';
  else this.loyaltyTier = 'Bronze';
};

const User = model('User', userSchema);

export default User;