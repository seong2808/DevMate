import mongoose, { Schema } from 'mongoose';
import {
  IGroup,
  GroupPositions,
  GroupTypes,
  Locations,
  GroupStatus,
} from '../types/groups-types';

const groupSchema = new Schema<IGroup>(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    // 그룹 생성하는 사람
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    currentMembers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(GroupTypes),
      required: true,
    },

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

    imageUrl: {
      type: String,
      default: '',
    },

    dueDate: { type: String },

    completedDate: { type: Date },

    skills: { type: [String] },

    maxMembers: { type: Number },

    viewCount: {
      type: Number,
      default: 0,
    },

    wishCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: Object.values(GroupStatus),
      default: GroupStatus.모집중,
    },

    // 신청 스키마 _id List
    joinReqList: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Join' }],
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  },
);

const Group = mongoose.model<IGroup>('Group', groupSchema);
export default Group;
