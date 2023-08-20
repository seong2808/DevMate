import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  nickName: string;
  password: string;
  profileImage?: string;
  overView?: string;
  skills: string[];
  links: {
    gitHub?: string;
    blog?: string;
  };
  wishList: (typeof Schema.Types.ObjectId)[];
  groups: (typeof Schema.Types.ObjectId)[];
  notifications: (typeof Schema.Types.ObjectId)[];
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true },
  nickName: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  overView: { type: String, default: '' },
  skills: { type: [String] },
  links: {
    gitHub: { type: String },
    blog: { type: String },
  },
  wishList: { type: [{ type: Schema.Types.ObjectId, ref: 'Group' }] },
  groups: { type: [{ type: Schema.Types.ObjectId, ref: 'Group' }] },
  notifications: { type: [{ type: Schema.Types.ObjectId, ref: 'Group' }] },
});

export default mongoose.model<IUser>('User', userSchema);
