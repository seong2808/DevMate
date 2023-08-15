import mongoose, { Schema, Document } from 'mongoose';

interface IGroup extends Document {
  title: string;
  author: typeof Schema.Types.ObjectId;
  description: string;
  type: string;
  position: string[];
  groupImage?: string;
  location?: string;
  dueDate?: string;
  skills: string[];
  maxMembers?: number;
  currentMembers: (typeof Schema.Types.ObjectId)[];
  viewCount?: number;
  wishCount?: number;
  status?: string;
}

const groupSchema = new Schema<IGroup>({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, required: true },
  type: { type: String, required: true },
  position: { type: [String] },
  groupImage: { type: String, default: '' },
  location: { type: String, default: '전국' },
  dueDate: { type: String },
  skills: { type: [String] },
  maxMembers: { type: Number },
  currentMembers: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }] },
  viewCount: { type: Number, default: 0 },
  wishCount: { type: Number, default: 0 },
  status: { type: String, default: '모집중' },
});

export default mongoose.model<IGroup>('Group', groupSchema);
