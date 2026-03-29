import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email:   { type: String, required: true },
  name:    { type: String },
  role:    { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', UserSchema)