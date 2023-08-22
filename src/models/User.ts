import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/users-types';

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true },
    nickname: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: '' },
    overview: { type: String, default: '' },
    skills: { type: [String] },
    links: {
      gitHub: { type: String },
      blog: { type: String },
    },
    wishList: { type: [{ type: Schema.Types.ObjectId, ref: 'Group' }] },
  },
  { strict: 'throw' },
);

export default mongoose.model<IUser>('User', userSchema);
