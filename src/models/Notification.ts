import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  // 알림을 받는 사람
  receiverId: string;
  // 알림을 보내는 사람
  senderId: string;
  // 신청 받은 그룹
  groupId: string;
  content: string;
  type: NotificationTypes;
  kind: NotificationKind;
  status?: boolean;
}

export type NotificationKind =
  | 'approval'
  | 'reject'
  | 'join'
  | 'exit'
  | 'delete';
export type NotificationTypes = 'study' | 'project';

const notificationSchema = new Schema<INotification>(
  {
    receiverId: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    groupId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['study', 'project'],
      required: true,
    },
    kind: {
      type: String,
      enum: ['approval', 'reject', 'join', 'exit', 'delete'],
      required: true,
    },
    status: {
      type: Boolean,
      // true = 알림 미확인, false = 확인 후 삭제
      default: true,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
    },
  },
);
const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema,
);
export default Notification;
