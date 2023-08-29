import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/users-types';

const userSchema = new Schema<IUser>({
  email: { type: String, required: true },
  nickname: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  overview: { type: String, default: '' },
  skills: { type: [String] },
  links: {
    gitHub: { type: String, default: '' },
    blog: { type: String, default: '' },
  },
  createdGroup: { type: Schema.Types.ObjectId, ref: 'Group' },

  wishList: { type: [{ type: Schema.Types.ObjectId, ref: 'Group' }] }, // 찜한 그룹 목록
  ongoingGroup: { type: [{ type: Schema.Types.ObjectId, ref: 'Group' }] },
  joinRequestGroup: { type: [{ type: Schema.Types.ObjectId, ref: 'Group' }] },
  notifications: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],
  },
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
