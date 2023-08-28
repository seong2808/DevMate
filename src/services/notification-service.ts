import mongoose from 'mongoose';
import Notification from '../models/Notification';
import UserService from './users-service';
import User from '../models/User';
import { ReturnDocument } from 'mongodb';

class NotificationService {
  async createNotification(notificationData: object) {
    console.log('1');
    const newNotification = new Notification(notificationData);
    const data = await newNotification.save();
    console.log(data);
    return data;
  }

  async getNotificationByUserId(
    userId: string | typeof mongoose.Types.ObjectId,
  ) {
    const userNotification = await User.findById(userId).populate(
      'notifications',
    );
    return userNotification;
  }

  async deleteByNotificationId(
    notificationId: string | typeof mongoose.Types.ObjectId,
  ) {
    const deleteData = await Notification.deleteOne({ _id: notificationId });
    return deleteData;
  }

  async deleteAll(userId: string | typeof mongoose.Types.ObjectId) {
    const deleteData = await Notification.deleteMany({ receiverId: userId });
    return deleteData;
  }
}

export default NotificationService;
