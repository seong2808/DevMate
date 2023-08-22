import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  // 알림을 받는 사람
  receiverId: typeof Schema.Types.ObjectId;
  // 알림을 보내는 사람
  senderId: typeof Schema.Types.ObjectId;
  // 신청 받은 그룹
  groupId?: typeof Schema.Types.ObjectId;
  reportId?: typeof Schema.Types.ObjectId;
  content?: string;
  type: NotificationTypes;
  kind: NotificationKind;
  status?: boolean;
}

export type NotificationKind = 'approval' | 'reject' | 'join';
export type NotificationTypes = 'study' | 'project';

const notificationSchema = new Schema<INotification>({
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
  },
  content: {
    type: String,
  },
  type: {
    type: String,
    enum: ['study', 'project'],
    required: true,
  },
  kind: {
    type: String,
    enum: ['approval', 'reject', 'join'],
    required: true,
  },
  status: {
    type: Boolean,
    // true = 알림 미확인, false = 확인 후 삭제
    default: true,
    required: true,
  },
});

export default mongoose.model<INotification>(
  'Notification',
  notificationSchema,
);
