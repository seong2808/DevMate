import mongoose, { Schema, Document } from 'mongoose';

export interface IJoin extends Document {
  userId: typeof Schema.Types.ObjectId;
  groupId: typeof Schema.Types.ObjectId;
  content: string;
  date: string;
}

const joinSchema = new Schema<IJoin>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  },
);

export default mongoose.model<IJoin>('Join', joinSchema);
