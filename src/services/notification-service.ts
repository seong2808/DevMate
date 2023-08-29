import mongoose from 'mongoose';
import Notification from '../models/Notification';
import User from '../models/User';
import Join from '../models/Join';
import Group from '../models/Group';
import { HttpError } from '../middlewares/error.handler';

class NotificationService {
  async createNotification(notificationData: object) {
    const newNotification = new Notification(notificationData);
    const data = await newNotification.save();
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

  async findByjoinReqListAndUpdate(
    joinReqList: (typeof mongoose.Schema.Types.ObjectId)[],
    groupId: string,
    userId: string,
  ) {
    Promise.allSettled(
      joinReqList.map(async (joinId) => {
        const join = await Join.findByIdAndDelete({ _id: joinId });
        const group = await Group.findByIdAndUpdate(groupId, {
          $pull: { joinReqList: joinId },
        });
        if (join && group) {
          const notificationData = {
            receiverId: join._id,
            senderId: userId,
            groupId: groupId,
            content: `${group.title} 그룹 가입 신청이 거절되었습니다.`,
            type: group.type,
            kind: 'reject',
          };

          const notification = new Notification(notificationData);
          const newNotification = await notification.save();

          const newUser = await User.findByIdAndUpdate(
            join.userId,
            {
              $pull: { joinRequestGroup: groupId },
              $push: { notifications: newNotification._id },
            },
            { new: true },
          );
        }
      }),
    )
      .then((result) => console.log('result : ', result))
      .catch((err) => {
        console.log(err);
        throw new HttpError('서버 에러 발생', 500);
      });
  }
}

export default NotificationService;
