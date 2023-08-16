import mongoose, { Schema } from 'mongoose';
import {
  IGroup,
  GroupPositions,
  GroupTypes,
  Locations,
  GroupStatus,
} from '../types/groups-types';

const groupSchema = new Schema<IGroup>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  currentMembers: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    required: true,
  },
  type: { type: String, enum: Object.values(GroupTypes), required: true },
  position: {
    type: [String],
    enum: Object.values(GroupPositions),
    required: true,
  },
  location: {
    type: String,
    enum: Object.values(Locations),
    required: true,
  },
  imageUrl: { type: String, default: '' },
  dueDate: { type: String },
  skills: { type: [String] },
  maxMembers: { type: Number },
  viewCount: { type: Number, default: 0 },
  wishCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: Object.values(GroupStatus),
    default: GroupStatus.모집중,
  },
});

const Group = mongoose.model<IGroup>('Group', groupSchema);
export default Group;
